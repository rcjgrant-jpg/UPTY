from rest_framework import serializers
from .models import User, Team, TeamMember, Monitor, MonitorResult, Incident, NotificationLog, Invite


class UserSerializer(serializers.ModelSerializer):
    """Converts User object to/from JSON"""
    class Meta:
        model = User
        fields = ['id', 'email']


class TeamSerializer(serializers.ModelSerializer):
    """Converts Team object to/from JSON"""
    class Meta:
        model = Team
        fields = ['id', 'name']


class TeamMemberSerializer(serializers.ModelSerializer):
    """Converts TeamMember object to/from JSON"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TeamMember
        fields = ['id', 'user', 'joined_at']


class MonitorSerializer(serializers.ModelSerializer):
    """Converts Monitor object to/from JSON"""
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Monitor
        fields = [
            'id', 'url', 'current_state', 'interval', 'timeout',
            'expected_status', 'failure_threshold', 'last_checked_at',
            'created_at', 'created_by'
        ]


class MonitorResultSerializer(serializers.ModelSerializer):
    """Converts MonitorResult object to/from JSON"""
    class Meta:
        model = MonitorResult
        fields = ['id', 'status_code', 'latency_ms', 'error_message', 'checked_at']


class IncidentSerializer(serializers.ModelSerializer):
    """Converts Incident object to/from JSON"""
    monitor = MonitorSerializer(read_only=True)
    resolved_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Incident
        fields = ['id', 'monitor', 'started_at', 'is_resolved', 'resolved_at', 'resolved_by']


class InviteSerializer(serializers.ModelSerializer):
    """Converts Invite object to/from JSON"""
    invited_by = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)
    
    class Meta:
        model = Invite
        fields = ['id', 'token', 'team', 'invited_by', 'expires_at', 'accepted']