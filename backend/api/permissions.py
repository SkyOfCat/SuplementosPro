# permissions.py
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado que verifica el campo is_admin
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)