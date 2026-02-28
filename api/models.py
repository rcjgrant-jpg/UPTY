from django.db import models

import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class Team(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('team', 'user')

    def __str__(self):
        return f"{self.user.email} in {self.team.name}"


class Monitor(models.Model):
    STATE_CHOICES = [
        ('UP', 'Up'),
        ('DOWN', 'Down'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='monitors')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monitors_created')

    url = models.URLField()
    interval = models.IntegerField(default=60)
    timeout = models.IntegerField(default=5000)
    expected_status = models.IntegerField(default=200)
    failure_threshold = models.IntegerField(default=3)

    current_state = models.CharField(max_length=4, choices=STATE_CHOICES, default='UP')
    last_checked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.url} ({self.current_state})"


class MonitorResult(models.Model):
    monitor = models.ForeignKey(Monitor, on_delete=models.CASCADE, related_name='results')

    status_code = models.IntegerField(null=True, blank=True)
    latency_ms = models.IntegerField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    checked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-checked_at']

    def __str__(self):
        return f"{self.monitor.url} - {self.status_code} at {self.checked_at}"


class Incident(models.Model):
    monitor = models.ForeignKey(Monitor, on_delete=models.CASCADE, related_name='incidents')

    started_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incidents_resolved'
    )

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        status = "Resolved" if self.is_resolved else "Open"
        return f"{self.monitor.url} - {status}"


class NotificationLog(models.Model):
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]

    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='notifications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications_received')

    sent_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')

    def __str__(self):
        return f"Notification to {self.user.email} - {self.status}"


class Invite(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='invites')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invites_sent')

    token = models.CharField(max_length=64, unique=True, default=secrets.token_urlsafe)
    expires_at = models.DateTimeField()
    accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return not self.accepted and timezone.now() < self.expires_at

    def __str__(self):
        return f"Invite to {self.team.name} (valid: {self.is_valid})"