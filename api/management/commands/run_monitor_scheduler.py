import time
from django.core.management.base import BaseCommand
from api.services import check_all_monitors


class Command(BaseCommand):
    help = "Continuously check monitors on a loop"

    def add_arguments(self, parser):
        parser.add_argument(
            "--sleep",
            type=int,
            default=1,
            help="Seconds to sleep between scheduler loops"
        )

    def handle(self, *args, **options):
        sleep_seconds = options["sleep"]
        self.stdout.write(self.style.SUCCESS(
            f"Monitor scheduler started (sleep={sleep_seconds}s)"
        ))

        while True:
            try:
                check_all_monitors()
            except Exception as e:
                self.stderr.write(f"Scheduler error: {e}")

            time.sleep(sleep_seconds)
