from django.urls import path, include
from rest_framework import routers
from . import views
from .views import ProteinaViewSet, SnackViewSet, CarritoViewSet, CreatinaViewSet, AminoacidoViewSet, VitaminaViewSet

route = routers.DefaultRouter()
route.register(r'proteinas', ProteinaViewSet, basename='proteina')
route.register(r'snacks', SnackViewSet, basename='snack')
route.register(r'creatinas', CreatinaViewSet, basename='creatina')
route.register(r'aminoacidos', AminoacidoViewSet, basename='aminoacido')
route.register(r'vitaminas', VitaminaViewSet, basename='vitamina')
route.register(r'carrito', CarritoViewSet, basename='carrito')
route.register(r'usuarios', views.UsuarioViewSet, basename='usuario')


urlpatterns = [
    path('usuario/actual/', views.get_usuario_actual, name='usuario-actual'),
    path('registro/', views.registro_usuario, name='registro_usuario'),
    # otras rutas... # si crea vistas en la api, solo ponga el nombre de la vista ej: registro/
    
    # route #
    path('', include(route.urls)),
]