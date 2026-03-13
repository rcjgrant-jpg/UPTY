from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, Team, TeamMember, Monitor


class MonitorModelTest(TestCase):
    """Test Monitor model"""

    def setUp(self):
        # Create user and team
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Test Team')
        TeamMember.objects.create(team=self.team, user=self.user)

    def test_create_monitor(self):
        """Test creating a monitor with default values"""
        monitor = Monitor.objects.create(
            team=self.team,
            created_by=self.user,
            url='https://example.com'
        )
        self.assertEqual(monitor.url, 'https://example.com')
        self.assertEqual(monitor.current_state, 'UP')
        self.assertEqual(monitor.interval, 60)
        self.assertEqual(monitor.timeout, 5000)
        self.assertEqual(monitor.failure_threshold, 3)

    def test_monitor_str(self):
        """Test monitor string representation"""
        monitor = Monitor.objects.create(
            team=self.team,
            created_by=self.user,
            url='https://example.com'
        )
        self.assertIn('https://example.com', str(monitor))


class MonitorAPITest(APITestCase):
    """Test Monitor API endpoints"""

    def setUp(self):
        # Create user and team
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Test Team')
        TeamMember.objects.create(team=self.team, user=self.user)

        # Login
        self.client.force_authenticate(user=self.user)

    def test_create_monitor(self):
        """Test creating a monitor via API"""
        url = reverse('monitors-list')
        data = {'url': 'https://google.com'}

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['url'], 'https://google.com')
        self.assertEqual(response.data['current_state'], 'UP')

    def test_list_monitors(self):
        """Test listing monitors"""
        # Create a monitor
        Monitor.objects.create(
            team=self.team,
            created_by=self.user,
            url='https://example.com'
        )

        url = reverse('monitors-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['monitors']), 1)

    def test_monitor_requires_auth(self):
        """Test that monitors endpoint requires authentication"""
        self.client.logout()

        url = reverse('monitors-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class CheckerServiceTest(TestCase):
    """Test monitor checking business logic"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='testpass123'
        )
        self.team = Team.objects.create(name='Test Team')
        TeamMember.objects.create(team=self.team, user=self.user)
        
        self.monitor = Monitor.objects.create(
            team=self.team,
            created_by=self.user,
            url='https://httpstat.us/200',  # Always returns 200
            failure_threshold=3
        )

    def test_process_monitor_result_up(self):
        """Test monitor stays UP when check passes"""
        from api.services import process_monitor_result
        
        process_monitor_result(self.monitor, is_up=True)
        
        self.monitor.refresh_from_db()
        self.assertEqual(self.monitor.current_state, 'UP')

    def test_monitor_goes_down_after_threshold(self):
        """Test monitor goes DOWN after N consecutive failures"""
        from api.services import process_monitor_result
        from api.models import MonitorResult
        
        # Simulate 3 failed checks (failure_threshold = 3)
        for i in range(3):
            MonitorResult.objects.create(
                monitor=self.monitor,
                status_code=500,
                latency_ms=100,
                error_message='Server error'
            )
            process_monitor_result(self.monitor, is_up=False)
        
        self.monitor.refresh_from_db()
        self.assertEqual(self.monitor.current_state, 'DOWN')

    def test_incident_created_when_down(self):
        """Test incident is created when monitor goes DOWN"""
        from api.services import process_monitor_result
        from api.models import MonitorResult, Incident
        
        # Simulate 3 failed checks
        for i in range(3):
            MonitorResult.objects.create(
                monitor=self.monitor,
                status_code=500,
                latency_ms=100
            )
            process_monitor_result(self.monitor, is_up=False)
        
        # Should have created an incident
        incidents = Incident.objects.filter(monitor=self.monitor)
        self.assertEqual(incidents.count(), 1)
        self.assertFalse(incidents.first().is_resolved)