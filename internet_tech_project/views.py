from django.http import HttpResponse
from django.conf import settings
import os


def index(request):
    """Serve the React frontend"""
    index_path = os.path.join(settings.FRONTEND_DIR, 'index.html')
    
    with open(index_path, 'r') as f:
        html = f.read()
    
    return HttpResponse(html)