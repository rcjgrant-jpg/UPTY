from django.contrib import admin
from .models import Team, TeamMember, Monitor, MonitorResult, Incident, NotificationLog, Invite

admin.site.register(Team)
admin.site.register(TeamMember)
admin.site.register(Monitor)
admin.site.register(MonitorResult)
admin.site.register(Incident)
admin.site.register(NotificationLog)
admin.site.register(Invite)
