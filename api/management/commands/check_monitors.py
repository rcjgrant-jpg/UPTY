from django.core.management.base import BaseCommand
from api.services import check_all_monitors


class Command(BaseCommand):
    help = 'Check all monitors and update their status'

    def handle(self, *args, **options):
        self.stdout.write('Checking all monitors...')
        check_all_monitors()
        self.stdout.write(self.style.SUCCESS('Done!'))