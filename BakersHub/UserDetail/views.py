from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ParseError

from django.utils import timezone
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth.hashers import check_password, make_password

from .models import *
from .serializers import *

import string
import random
from datetime import datetime, timedelta

from utils.decorators import *


class TempViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    @check_authentication()
    def list(self, request):
        any_get_data = request.query_params.get('any_get_data')
        if not any_get_data:
            return Response(
                        {
                            "success": False,
                            "user_not_logged_in": False,
                            "user_unauthorized": False,
                            "data": None,
                            "error": "Missing any_get_data."
                        }, status=status.HTTP_400_BAD_REQUEST)

        data = {}
        return Response(
                    {
                        "success": True,
                        "user_not_logged_in": False,
                        "user_unauthorized": False,
                        "data": data,
                        "error": None
                    }, status=status.HTTP_200_OK)

    @handle_exceptions
    @check_authentication(required_role='admin')
    def create(self, request):
            any_post_data = request.data.get('any_post_data')
            if not any_post_data:
                return Response(
                            {
                                "success": False,
                                "user_not_logged_in": False,
                                "user_unauthorized": False,
                                "data": None,
                                "error": "Missing any_post_data."
                            }, status=status.HTTP_400_BAD_REQUEST)

            data = {}         

            return Response(
                        {
                            "success": True,  
                            "user_not_logged_in": False,
                            "user_unauthorized": False,                       
                            "data": data,
                            "error": None
                        }, status=status.HTTP_201_CREATED)


class OtpAuthViewSet(viewsets.ViewSet):

    @handle_exceptions
    def create(self, request):
        """
        API 1: Generate OTP
        """
        mobile = request.data.get("mobile")
        if not mobile:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Mobile number is required."
            }, status=status.HTTP_400_BAD_REQUEST)

        otp = self.generate_send_otp(contact_number=mobile)
        otp_obj = OTPVerification.objects.create(
            mobile=mobile,
            otp=otp,
            expires_at=timezone.now() + timedelta(minutes=5),
            is_verified=False,
            attempt_count=0
        )

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": {"otp_id": otp_obj.id, "otp": otp},  # remove otp in production
            "error": None
        }, status=status.HTTP_201_CREATED)

    @handle_exceptions
    def update(self, request, pk):
        """
        API 2: Verify OTP & Login/Register
        """

        otp_id = pk
        otp = request.data.get("otp")
        
        if not otp_id or not otp:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "otp_id & otp are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_obj = OTPVerification.objects.get(id=otp_id)
        except OTPVerification.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "Invalid OTP ID."
            }, status=status.HTTP_404_NOT_FOUND)

        if otp_obj.is_verified:
            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": {"otp_verified": False, "message": "OTP already used."},
                "error": None
            }, status=status.HTTP_200_OK)

        if otp_obj.expires_at < timezone.now():
            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": {"otp_verified": False, "message": "OTP expired."},
                "error": None
            }, status=status.HTTP_200_OK)

        if otp_obj.attempt_count >= 3:
            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": {"otp_verified": False, "message": "Maximum attempts reached."},
                "error": None
            }, status=status.HTTP_200_OK)

        if otp_obj.otp != otp:
            otp_obj.attempt_count += 1
            otp_obj.save()
            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": {"otp_verified": False, "message": "Incorrect OTP."},
                "error": None
            }, status=status.HTTP_200_OK)

        # OTP is correct
        otp_obj.is_verified = True
        otp_obj.save()

        user = User.objects.filter(contact_number=otp_obj.mobile).first()

        if user:
            user_details_filled = bool(user.first_name and user.last_name and user.email)
        else:
            user = User.objects.create(
                contact_number=otp_obj.mobile,
                role='customer'
            )
            user_details_filled = False

        old_session_id = request.session.get('session_token')

        login(request, user)
        new_session_id = request.session.get('session_token')

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": {
                "otp_verified": True,
                "user_id": user.user_id,
                "user_details": user_details_filled,
                "old_session_id": old_session_id
            },
            "error": None
        }, status=status.HTTP_200_OK)

    def generate_send_otp(self, contact_number):
        otp = ''.join(random.choices('0123456789', k=6))
        print(f"Sending OTP: {otp} to {contact_number}")

        return otp


class IsUserLoggedInViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    @check_authentication()
    def list(self, request):
        user = request.user
        userData = User.objects.filter(user_id=user.user_id).first()
        user_data = UserSerializer(userData).data
        
        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": user_data,
            "error": None
        }, status=status.HTTP_200_OK)


class UserDetailViewSet(viewsets.ViewSet):

    @handle_exceptions
    def create(self, request):
        """
        API 3: Fill User Details after OTP verification
        """
        user = request.user

        firstName = request.data.get('firstName')
        lastName = request.data.get('lastName')
        email = request.data.get('email')
        address = request.data.get('address')
        city = request.data.get('city')
        alternate_phone = request.data.get('alternate_phone', "")
        pincode = request.data.get('pincode')

        user_obj = User.objects.get(user_id=user.user_id)
        user_obj.first_name = firstName
        user_obj.last_name = lastName
        user_obj.email = email
        user_obj.alternate_phone = alternate_phone
        user_obj.save()

        return Response({
            "success": True,
            "user_not_logged_in": False,
            "user_unauthorized": False,
            "data": "User details updated successfully.",
            "error": None
        }, status=status.HTTP_200_OK)


class UserProfileViewSet(viewsets.ViewSet):
    
    @handle_exceptions
    @check_authentication()
    def list(self, request):
        user_id = request.user.user_id
        
        try:
            user = User.objects.get(user_id=user_id)
            user_data = UserSerializer(user).data

            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": {"user": user_data},
                "error": None
            }, status=200)
            
        except User.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "User not found."
            }, status=404)

    @handle_exceptions
    # @check_authentication()(required_role="customer")
    def update(self, request, pk=None):
        """
        Update user profile information
        """
        user_id = request.user.user_id
        data = request.data
        user_pk = pk
        
        try:
            user = User.objects.get(user_id=user_id)
            
            # Update allowed fields
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'email' in data:
                # Check if email is already taken by another user
                if User.objects.filter(email=data['email']).exclude(user_id=user_id).exists():
                    return Response({
                        "success": False,
                        "user_not_logged_in": False,
                        "user_unauthorized": False,
                        "data": None,
                        "error": "Email is already taken."
                    }, status=400)
                user.email = data['email']
            if 'date_of_birth' in data:
                user.date_of_birth = data['date_of_birth']
            if 'email_notifications' in data:
                user.email_notifications = data['email_notifications']
            if 'sms_notifications' in data:
                user.sms_notifications = data['sms_notifications']
            if 'promotional_emails' in data:
                user.promotional_emails = data['promotional_emails']
            
            user.save()
            
            return Response({
                "success": True,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": {"message": "Profile updated successfully"},
                "error": None
            }, status=200)
            
        except User.DoesNotExist:
            return Response({
                "success": False,
                "user_not_logged_in": False,
                "user_unauthorized": False,
                "data": None,
                "error": "User not found."
            }, status=404)


def login_to_account(request):
    try:
        request_user = request.user
        username = request.GET.get('username')
        print(username)

        user = User.objects.get(username=username)

        if request_user.is_staff:
            print('Staff')
            login(request, user)

        return HttpResponse('DONE')
        return redirect('dashboard-list')

    except Exception as e:
        print(e)
        return HttpResponse('DONE')
        return redirect('dashboard-list')

