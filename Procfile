web: gunicorn internet_tech_project.wsgi:application --bind 0.0.0.0:$PORT
worker: python manage.py run_monitor_scheduler
