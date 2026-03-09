from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login_view, name='login'),
    path('auth/logout', views.logout_view, name='logout'),
    path('auth/me', views.me, name='me'),
    path('auth/csrf', views.csrf, name='csrf'),

    # Monitors
    path('monitors', views.monitors_list, name='monitors-list'),
    path('monitors/<int:pk>', views.monitor_detail, name='monitor-detail'),

    # Incidents
    path('incidents', views.incidents_list, name='incidents-list'),
    path('incidents/<int:pk>/resolve', views.resolve_incident, name='resolve-incident'),

    # Team
    path('team', views.team_info, name='team-info'),
    path('team/invite', views.create_invite, name='create-invite'),
    path('invite/<str:token>', views.validate_invite, name='validate-invite'),
    path('invite/<str:token>/accept', views.accept_invite, name='accept-invite'),

    # Settings
    path('settings/email', views.update_email, name='update-email'),
    path('settings/password', views.update_password, name='update-password'),
]