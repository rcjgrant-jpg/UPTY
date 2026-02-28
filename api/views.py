from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout

from .models import User, Team, TeamMember
from .serializers import UserSerializer, TeamSerializer


# AUTH VIEWS

@api_view(['POST'])
@permission_classes([AllowAny])  # Anyone can register (no login required)
def register(request):
    """
    Create a new user and team.
    
    Expected JSON:
    {
        "email": "user@example.com",
        "password": "securepassword",
        "team_name": "My Startup"
    }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    team_name = request.data.get('team_name')
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user (username = email for simplicity)
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )
    
    # Create team
    team = Team.objects.create(name=team_name)
    
    # Add user to team
    TeamMember.objects.create(team=team, user=user)
    
    # Log the user in
    login(request, user)
    
    return Response({
        'id': user.id,
        'email': user.email,
        'team': {
            'id': team.id,
            'name': team.name
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])  # Anyone can try to login
def login_view(request):
    """
    Log in a user.
    
    Expected JSON:
    {
        "email": "user@example.com",
        "password": "securepassword"
    }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Check credentials
    user = authenticate(username=email, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Log the user in (creates session)
    login(request, user)
    
    # Get user's team
    membership = user.memberships.first()
    team = membership.team if membership else None
    
    return Response({
        'id': user.id,
        'email': user.email,
        'team': {
            'id': team.id,
            'name': team.name
        } if team else None
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Must be logged in
def logout_view(request):
    """
    Log out the current user.
    """
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Must be logged in
def me(request):
    """
    Get current logged-in user info.
    """
    user = request.user
    membership = user.memberships.first()
    team = membership.team if membership else None
    
    return Response({
        'id': user.id,
        'email': user.email,
        'team': {
            'id': team.id,
            'name': team.name
        } if team else None
    })
