from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.serializers import MiTokenObtainPairSerializer  # Importar el serializer

# Vista personalizada para login
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MiTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT Simple - Usando serializer personalizado #
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('api.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)