import threading
import time
from django.conf import settings
from .services import check_all_monitors


def start_monitor_scheduler():
    sleep_seconds = 1

    def run():
        print("Monitor scheduler started")
        while True:
            try:
                check_all_monitors()
            except Exception as e:
                print(f"Scheduler error: {e}")
            time.sleep(sleep_seconds)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
