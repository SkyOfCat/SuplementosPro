from django.urls import path, include
from rest_framework import routers
from . import views
from .views import ProteinaViewSet, SnackViewSet, CarritoViewSet, CreatinaViewSet, AminoacidoViewSet, VitaminaViewSet

router = routers.DefaultRouter()
router.register(r'proteinas', ProteinaViewSet, basename='proteina')
router.register(r'snacks', SnackViewSet, basename='snack')
router.register(r'creatinas', CreatinaViewSet, basename='creatina')
router.register(r'aminoacidos', AminoacidoViewSet, basename='aminoacido')
router.register(r'vitaminas', VitaminaViewSet, basename='vitamina')
router.register(r'carrito', CarritoViewSet, basename='carrito')
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')


urlpatterns = [
    path('usuario/actual/', views.get_usuario_actual, name='usuario-actual'),
    path('registro/', views.registro_usuario, name='registro_usuario'),
    # otras rutas... # si crea vistas en la api, solo ponga el nombre de la vista ej: registro/
    
    # route #
    path('', include(router.urls)),
]