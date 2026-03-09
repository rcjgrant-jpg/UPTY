from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, Team, TeamMember, Monitor

# Create your tests here.

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
