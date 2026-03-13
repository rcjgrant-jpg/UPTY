import httpx
from django.utils import timezone
from .models import Monitor, MonitorResult, Incident, NotificationLog


def check_monitor(monitor):
    """
    Check a single monitor and record the result.
    Returns True if UP, False if DOWN.
    """
    try:
        # Make HTTP request
        with httpx.Client(timeout=monitor.timeout / 1000) as client:
            start_time = timezone.now()
            response = client.get(monitor.url)
            end_time = timezone.now()
            
            # Calculate latency in milliseconds
            latency_ms = int((end_time - start_time).total_seconds() * 1000)
            
            # Check if status matches expected
            is_up = response.status_code == monitor.expected_status
            
            # Record result
            MonitorResult.objects.create(
                monitor=monitor,
                status_code=response.status_code,
                latency_ms=latency_ms,
                error_message=None if is_up else f"Expected {monitor.expected_status}, got {response.status_code}"
            )
            
            return is_up, response.status_code, latency_ms
            
    except Exception as e:
        # Request failed (timeout, connection error, etc.)
        MonitorResult.objects.create(
            monitor=monitor,
            status_code=None,
            latency_ms=None,
            error_message=str(e)
        )
        return False, None, None


def process_monitor_result(monitor, is_up):
    """
    Update monitor state and create incident if needed.
    """
    if is_up:
        # Monitor is UP
        monitor.current_state = 'UP'
        monitor.last_checked_at = timezone.now()
        monitor.save()
    else:
        # Monitor is DOWN - check if we need to create incident
        monitor.last_checked_at = timezone.now()
        
        # Count recent consecutive failures
        recent_results = monitor.results.order_by('-checked_at')[:monitor.failure_threshold]
        consecutive_failures = sum(
            1 for r in recent_results 
            if r.status_code != monitor.expected_status or r.status_code is None
        )
        
        if consecutive_failures >= monitor.failure_threshold:
            # Change state to DOWN
            was_up = monitor.current_state == 'UP'
            monitor.current_state = 'DOWN'
            monitor.save()
            
            # Create incident if this is a new outage
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