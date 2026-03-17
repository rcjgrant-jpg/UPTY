from django.shortcuts import render, get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import User, Team, TeamMember, Monitor, MonitorResult, Incident, Invite
from .serializers import (
    UserSerializer, TeamSerializer, MonitorSerializer,
    MonitorResultSerializer, IncidentSerializer
)
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import os

# AUTH VIEWS

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Create a new user.

    Normal registration:
    {
        "email": "user@example.com",
        "password": "securepassword",
        "team_name": "My Startup"
    }

    Invite registration:
    {
        "email": "user@example.com",
        "password": "securepassword",
        "invite_token": "abc123..."
    }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    team_name = request.data.get('team_name')
    invite_token = request.data.get('invite_token')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    try:
        validate_password(password)
    except ValidationError as e:
        return Response(
            {'error': ' '.join(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )

    invite = None
    if invite_token:
        try:
            invite = Invite.objects.get(token=invite_token)
        except Invite.DoesNotExist:
            return Response(
                {'error': 'Invite not found'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not invite.is_valid:
            return Response(
                {'error': 'Invite expired or already used'},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        if not team_name:
            return Response(
                {'error': 'Team name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )

    if invite:
        team = invite.team
        TeamMember.objects.create(team=team, user=user)

        invite.accepted = True
        invite.save()
    else:
        team = Team.objects.create(name=team_name)
        TeamMember.objects.create(team=team, user=user)

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
@permission_classes([IsAuthenticated])
def accept_invite(request, token):
    try:
        invite = Invite.objects.get(token=token)
    except Invite.DoesNotExist:
        return Response(
            {'error': 'Invite not found'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not invite.is_valid:
        return Response(
            {'error': 'Invite expired or already used'},
            status=status.HTTP_400_BAD_REQUEST
        )

    current_membership = TeamMember.objects.filter(user=request.user).first()

    if current_membership and current_membership.team_id == invite.team.id:
        return Response({
            'message': 'Already a member of this team',
            'team': {
                'id': invite.team.id,
                'name': invite.team.name
            }
        }, status=status.HTTP_200_OK)

    if current_membership:
        current_membership.delete()

    TeamMember.objects.create(team=invite.team, user=request.user)

    invite.accepted = True
    invite.save()

    return Response({
        'message': 'Successfully joined team',
        'team': {
            'id': invite.team.id,
            'name': invite.team.name
        }
    }, status=status.HTTP_200_OK)

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

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf(request):
    return Response({'message': 'CSRF cookie set'})

# MONITOR VIEWS

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def monitors_list(request):
    """
    GET: List all monitors for the user's team
    POST: Create a new monitor
    """
    membership = request.user.memberships.first()
    if not membership:
        return Response(
            {'error': 'You are not in a team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    team = membership.team

    if request.method == 'GET':
        monitors = Monitor.objects.filter(team=team).order_by(
            '-current_state',
            '-last_checked_at'
        )
        serializer = MonitorSerializer(monitors, many=True)
        return Response({'monitors': serializer.data})

    elif request.method == 'POST':
        url = request.data.get('url')

        if not url:
            return Response(
                {'error': 'URL is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        monitor = Monitor.objects.create(
            team=team,
            created_by=request.user,
            url=url,
            interval=request.data.get('interval', 60),
            timeout=request.data.get('timeout', 5000),
            expected_status=request.data.get('expected_status', 200),
            failure_threshold=request.data.get('failure_threshold', 3)
        )

        serializer = MonitorSerializer(monitor)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def monitor_detail(request, pk):
    """
    GET: Get a single monitor with recent results
    DELETE: Delete a monitor
    """
    membership = request.user.memberships.first()
    if not membership:
        return Response(
            {'error': 'You are not in a team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    team = membership.team

    monitor = get_object_or_404(Monitor, pk=pk, team=team)

    if request.method == 'GET':
        serializer = MonitorSerializer(monitor)
        data = serializer.data

        recent_results = monitor.results.all()[:10]
        data['recent_results'] = MonitorResultSerializer(recent_results, many=True).data

        return Response(data)

    elif request.method == 'DELETE':
        monitor.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# INCIDENT VIEWS

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def incidents_list(request):
    """
    GET: List all incidents for the user's team
    """
    membership = request.user.memberships.first()
    if not membership:
        return Response(
            {'error': 'You are not in a team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    team = membership.team

    # Get incidents for monitors belonging to this team
    incidents = Incident.objects.filter(monitor__team=team).order_by('-started_at')
    serializer = IncidentSerializer(incidents, many=True)
    return Response({'incidents': serializer.data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_incident(request, pk):
    """
    POST: Mark an incident as resolved
    """
    from django.utils import timezone

    membership = request.user.memberships.first()
    if not membership:
        return Response(
            {'error': 'You are not in a team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    team = membership.team

    incident = get_object_or_404(Incident, pk=pk, monitor__team=team)

    if incident.is_resolved:
        return Response(
            {'error': 'Incident already resolved'},
            status=status.HTTP_400_BAD_REQUEST
        )

    incident.is_resolved = True
    incident.resolved_at = timezone.now()
    incident.resolved_by = request.user
    incident.save()

    serializer = IncidentSerializer(incident)
    return Response(serializer.data)

# TEAM VIEWS 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_info(request):
    """
    GET: Get team info and list of members
    """
    membership = request.user.memberships.first()
    if not membership:
        return Response(
            {'error': 'You are not in a team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    team = membership.team

    # Get all members
    members = []
    for tm in team.memberships.all():
        members.append({
            'id': tm.user.id,
            'email': tm.user.email,
            'joined_at': tm.joined_at
        })

    return Response({
        'id': team.id,
        'name': team.name,
        'members': members
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_invite(request):
    """
    POST: Generate an invite link for the team
    """
    from .models import Invite

    membership = request.user.memberships.first()
    if not membership:
        return Response(
            {'error': 'You are not in a team'},
            status=status.HTTP_400_BAD_REQUEST
        )
    team = membership.team

    # Create invite
    invite = Invite.objects.create(
        team=team,
        invited_by=request.user
    )

    frontend_base_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")

    return Response({
        'token': invite.token,
        'url': f'{frontend_base_url}/invite/{invite.token}',
        'expires_at': invite.expires_at
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def validate_invite(request, token):
    """
    GET: Check if invite token is valid
    """
    from .models import Invite

    try:
        invite = Invite.objects.get(token=token)
    except Invite.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Invite not found'
        }, status=status.HTTP_400_BAD_REQUEST)

    if not invite.is_valid:
        return Response({
            'valid': False,
            'error': 'Invite expired or already used'
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'valid': True,
        'team_name': invite.team.name,
        'invited_by': invite.invited_by.email,
        'expires_at': invite.expires_at
    })


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def accept_invite(request, token):
#     """
#     POST: Accept an invite and join the team
#     """
#     from .models import Invite

#     try:
#         invite = Invite.objects.get(token=token)
#     except Invite.DoesNotExist:
#         return Response({
#             'error': 'Invite not found'
#         }, status=status.HTTP_400_BAD_REQUEST)

#     if not invite.is_valid:
#         return Response({
#             'error': 'Invite expired or already used'
#         }, status=status.HTTP_400_BAD_REQUEST)

#     # Check if user is already in this team
#     if TeamMember.objects.filter(team=invite.team, user=request.user).exists():
#         return Response({
#             'error': 'You are already in this team'
#         }, status=status.HTTP_400_BAD_REQUEST)

#     # Add user to team
#     TeamMember.objects.create(team=invite.team, user=request.user)

#     # Mark invite as used
#     invite.accepted = True
#     invite.save()

#     return Response({
#         'message': 'Successfully joined team',
#         'team': {
#             'id': invite.team.id,
#             'name': invite.team.name
#         }
#     })

# SETTINGS VIEWS

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_email(request):
    """
    PUT: Update user's email
    """
    new_email = request.data.get('email')

    if not new_email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if email already taken
    if User.objects.filter(email=new_email).exclude(id=request.user.id).exists():
        return Response(
            {'error': 'Email already in use'},
            status=status.HTTP_400_BAD_REQUEST
        )

    request.user.email = new_email
    request.user.username = new_email  # Keep username in sync
    request.user.save()

    return Response({
        'id': request.user.id,
        'email': request.user.email
    })

from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash
from django.core.exceptions import ValidationError

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_password(request):
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    if not current_password or not new_password:
        return Response(
            {'error': 'Current password and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not request.user.check_password(current_password):
        return Response(
            {'error': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_password(new_password, request.user)
    except ValidationError as e:
        return Response(
            {'error': ' '.join(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )

    request.user.set_password(new_password)
    request.user.save()

    update_session_auth_hash(request, request.user)

    return Response({'message': 'Password updated successfully'})