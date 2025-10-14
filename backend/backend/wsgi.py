"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
# Para servir archivos media en producción (solo si es necesario)
from django.conf import settings
from django.urls import path
from django.views.static import serve

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_wsgi_application()


if not settings.DEBUG:
    # Esto ayuda a servir archivos media en Render
    application = get_wsgi_application()