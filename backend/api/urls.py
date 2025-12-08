from django.urls import path, include
from rest_framework import routers
from . import views
from .views import ProteinaViewSet, SnackViewSet, CarritoViewSet, CreatinaViewSet, AminoacidoViewSet, VitaminaViewSet
from .views import CrearOrdenPayPal, CapturarOrdenPayPal, CrearPreferenciaMP, ConfirmarPagoMP

router = routers.DefaultRouter()
router.register(r'proteinas', ProteinaViewSet, basename='proteina')
router.register(r'snacks', SnackViewSet, basename='snack')
router.register(r'creatinas', CreatinaViewSet, basename='creatina')
router.register(r'aminoacidos', AminoacidoViewSet, basename='aminoacido')
router.register(r'vitaminas', VitaminaViewSet, basename='vitamina')
router.register(r'carrito', CarritoViewSet, basename='carrito')
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')
router.register(r'mis-compras', views.MisComprasViewSet, basename='mis-compras')


urlpatterns = [
    path('usuario/actual/', views.get_usuario_actual, name='usuario-actual'),
    path('registro/', views.registro_usuario, name='registro_usuario'),
    path('password-reset/request/', views.password_reset_request, name='password-reset-request'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    path('password-reset/validate-token/<uuid:token>/', views.password_reset_validate_token, name='password-reset-validate-token'),
    path('pagos/paypal/crear/', CrearOrdenPayPal.as_view()),
    path('pagos/paypal/capturar/', CapturarOrdenPayPal.as_view()),
    path('pagos/mercadopago/crear/', CrearPreferenciaMP.as_view()),
    path('pagos/mercadopago/confirmar/', ConfirmarPagoMP.as_view()),
    # otras rutas... # si crea vistas en la api, solo ponga el nombre de la vista ej: registro/
    
    # route #
    path('', include(router.urls)),
]