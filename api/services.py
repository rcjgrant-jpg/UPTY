import time
import httpx
from django.conf import settings
from django.utils import timezone
from .models import Monitor, MonitorResult, Incident, NotificationLog


def check_monitor(monitor):
    """
    Check a single monitor and record the result.
    Returns (is_up, status_code, latency_ms).
    """
    started = time.perf_counter()

    try:
        with httpx.Client(
            timeout=monitor.timeout / 1000.0,
            follow_redirects=True,
            trust_env=False,
            verify=getattr(settings, "MONITOR_VERIFY_SSL", True),
        ) as client:
            response = client.get(monitor.url)

        latency_ms = int((time.perf_counter() - started) * 1000)
        is_up = response.status_code == monitor.expected_status

        MonitorResult.objects.create(
            monitor=monitor,
            status_code=response.status_code,
            latency_ms=latency_ms,
            error_message=None if is_up else f"Expected {monitor.expected_status}, got {response.status_code}",
        )

        return is_up, response.status_code, latency_ms

    except httpx.RequestError as e:
        latency_ms = int((time.perf_counter() - started) * 1000)

        MonitorResult.objects.create(
            monitor=monitor,
            status_code=None,
            latency_ms=latency_ms,
            error_message=f"{e.__class__.__name__}: {e}",
        )

        return False, None, latency_ms

    except Exception as e:
        latency_ms = int((time.perf_counter() - started) * 1000)

        MonitorResult.objects.create(
            monitor=monitor,
            status_code=None,
            latency_ms=latency_ms,
            error_message=f"{e.__class__.__name__}: {e}",
        )

        return False, None, latency_ms


def process_monitor_result(monitor, is_up):
    """
    Update monitor state and create incident if needed.
    """
    monitor.last_checked_at = timezone.now()

    if is_up:
        monitor.current_state = "UP"
        monitor.save()
        return

    recent_results = monitor.results.order_by("-checked_at")[:monitor.failure_threshold]
    consecutive_failures = sum(
        1 for r in recent_results
        if r.status_code != monitor.expected_status or r.status_code is None
    )

    if consecutive_failures >= monitor.failure_threshold:
        was_up = monitor.current_state == "UP"
        monitor.current_state = "DOWN"
        monitor.save()

        if was_up:
            create_incident(monitor)
    else:
        monitor.save()



def create_incident(monitor):
    """
    Create a new incident for a monitor that just went down.
    """
    incident = Incident.objects.create(monitor=monitor)
    
    # Log notification (in real app, would send email here)
    NotificationLog.objects.create(
        incident=incident,
        user=monitor.created_by,
        status='sent'
    )
    
    return incident


def check_all_monitors():
    """
    Check all monitors that are due for checking.
    """
    monitors = Monitor.objects.all()
    
    for monitor in monitors:
        # Check if it's time to check this monitor
        if monitor.last_checked_at is None:
            should_check = True
        else:
            seconds_since_check = (timezone.now() - monitor.last_checked_at).total_seconds()
            should_check = seconds_since_check >= monitor.interval
        
        if should_check:
            is_up, status_code, latency = check_monitor(monitor)
            process_monitor_result(monitor, is_up)