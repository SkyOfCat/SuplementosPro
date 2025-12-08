import mercadopago
import requests
import base64
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdminUser
from rest_framework.response import Response
from django.db import models, transaction
from django.db.models import Sum, F
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.html import strip_tags
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .serializers import UsuarioSerializer, UsuarioRegistroSerializer, ProteinaSerializer, SnackSerializer, UsuarioUpdateSerializer
from .serializers import CreatinaSerializer, AminoacidoSerializer, VitaminaSerializer
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from .serializers import VentaSerializer
from .models import Proteina, Snack, Creatina, Aminoacido, Vitamina, Venta, DetalleVenta, Carrito, ItemCarrito, Usuario
from .models import PasswordResetToken

Usuario = get_user_model()

# -- Pedidos al Correo -- #
def enviar_correo_confirmacion(venta):
    """
    Envía un correo con el detalle de la compra al cliente.
    """
    try:
        subject = f'Confirmación de Pedido #{venta.folio}'
        recipient_list = [venta.cliente.email] # Asumimos que el User tiene email

        # Obtener los detalles de la venta
        detalles = venta.detalleventa_set.all()
        
        # Construir lista de productos para el HTML
        items_html = ""
        total_calculado = 0

        for det in detalles:
            # Lógica para obtener el nombre según el tipo de producto que tengas en tu modelo
            nombre_producto = "Producto"
            if det.proteina: nombre_producto = det.proteina.nombre
            elif det.snack: nombre_producto = det.snack.nombre
            elif det.creatina: nombre_producto = det.creatina.nombre
            elif det.aminoacido: nombre_producto = det.aminoacido.nombre
            elif det.vitamina: nombre_producto = det.vitamina.nombre
            
            subtotal = det.cantidad * det.precio_unitario
            total_calculado += subtotal

            # Fila de tabla HTML simple
            items_html += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{nombre_producto}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">{det.cantidad}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${det.precio_unitario}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${subtotal}</td>
            </tr>
            """

        # Cuerpo del correo en HTML
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #2c3e50;">¡Gracias por tu compra, {venta.cliente.nombre}!</h2>
            <p>Tu pedido <strong>#{venta.folio}</strong> ha sido confirmado exitosamente.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: center;">Cant.</th>
                        <th style="padding: 10px; text-align: right;">Precio</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">TOTAL:</td>
                        <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em;">${total_calculado}</td>
                    </tr>
                </tfoot>
            </table>
            
            <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
                Si tienes dudas, contáctanos respondiendo a este correo.
            </p>
        </body>
        </html>
        """

        # Crear el objeto de correo
        text_content = strip_tags(html_content) # Versión texto plano por si falla HTML
        email = EmailMultiAlternatives(
            subject,
            text_content,
            settings.EMAIL_HOST_USER,
            recipient_list
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        print(f"📧 Correo enviado a {venta.cliente.email}")
        return True

    except Exception as e:
        print(f"❌ Error enviando correo: {str(e)}")
        # No queremos que falle la venta si falla el correo, así que solo retornamos False
        return False
# --- --- --- --- #

# --- USUARIOS --- #
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_usuario_actual(request):
    """
    Obtiene los datos del usuario autenticado
    """
    try:
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': 'Error al obtener datos del usuario'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def registro_usuario(request):
    if request.method == 'POST':
        # Agregar confirmar_password a los datos
        data = request.data.copy()
        data['confirmar_password'] = data.get('password')  # Para validación
        
        serializer = UsuarioRegistroSerializer(data=data)
        
        if serializer.is_valid():
            usuario = serializer.save()
            return Response({
                'message': 'Usuario registrado exitosamente',
                'usuario': {
                    'id': usuario.id,
                    'email': usuario.email,
                    'nombre': usuario.nombre,
                    'rut': usuario.rut
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        # ✅ Usar UsuarioUpdateSerializer para actualizaciones
        if self.action in ['update', 'partial_update']:
            return UsuarioUpdateSerializer
        return UsuarioSerializer

    def get_queryset(self):
        # Solo administradores pueden ver todos los usuarios
        if self.request.user.is_admin:
            return Usuario.objects.all().order_by('-id')
        return Usuario.objects.none()

    def list(self, request, *args, **kwargs):
        # Verificar explícitamente que el usuario sea admin
        if not request.user.is_admin:
            return Response(
                {"error": "No tienes permisos para ver los usuarios"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response(
                {"error": "No tienes permisos para ver este usuario"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response(
                {"error": "No tienes permisos para actualizar usuarios"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Prevenir que un usuario se elimine a sí mismo
        if instance.id == request.user.id:
            return Response(
                {"error": "No puedes eliminarte a ti mismo"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Solo administradores pueden eliminar usuarios
        if not request.user.is_admin:
            return Response(
                {"error": "No tienes permisos para eliminar usuarios"}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        self.perform_destroy(instance)
        return Response(
            {"message": "Usuario eliminado correctamente"}, 
            status=status.HTTP_200_OK
        )

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response(
                {"error": "No tienes permisos para crear usuarios"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        # Para crear usuarios, usar el serializer de registro
        serializer = UsuarioRegistroSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response({
                'message': 'Usuario creado exitosamente',
                'usuario': {
                    'id': usuario.id,
                    'email': usuario.email,
                    'nombre': usuario.nombre,
                    'rut': usuario.rut
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = Usuario.objects.get(email=email, is_active=True)
        
        # Invalidar tokens anteriores del usuario
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
        
        # Crear nuevo token de reset
        reset_token = PasswordResetToken.objects.create(user=user)
        
        # Construir URL para el frontend
        reset_url = f"{settings.FRONTEND_URL}/resetear-contrasena/{reset_token.token}"
        
        # Enviar email con template HTML
        subject = 'Recuperación de Contraseña - SuplementosPro'
        html_message = render_to_string('emails/password_reset.html', {
            'user': user,
            'reset_url': reset_url,
            'expiration_hours': 24
        })
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                html_message=html_message,
                fail_silently=False,
            )
            
            return Response({
                'message': 'Se ha enviado un enlace de recuperación a tu email.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error enviando email: {e}")
            return Response({
                'error': 'Error al enviar el email. Por favor intenta más tarde.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']
        
        try:
            # Cambiar contraseña del usuario
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            # Marcar token como usado
            reset_token.used = True
            reset_token.save()
            
            # Invalidar otros tokens activos del usuario
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
            
            return Response({
                'message': 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Error al restablecer la contraseña.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def password_reset_validate_token(request, token):
    """Validar si un token es válido (para el frontend)"""
    try:
        reset_token = PasswordResetToken.objects.get(token=token, used=False)
        if reset_token.is_valid():
            return Response({
                'valid': True,
                'email': reset_token.user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'error': 'Token expirado'
            }, status=status.HTTP_400_BAD_REQUEST)
    except PasswordResetToken.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Token inválido'
        }, status=status.HTTP_404_NOT_FOUND)
# --- --- --- --- --- #

# --- PROTEINAS --- #

class ProteinaViewSet(viewsets.ModelViewSet):
    queryset = Proteina.objects.all()
    serializer_class = ProteinaSerializer
    
    def get_permissions(self):
        """
        Permisos personalizados:
        - Listar y ver detalles: Público (AllowAny)
        - Crear, actualizar, eliminar: Solo administradores (IsAdminUser personalizado)
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]  # Usar tu permiso personalizado
        return [permission() for permission in permission_classes]
# --- --- --- --- --- #

# --- SNACKS --- #
class SnackViewSet(viewsets.ModelViewSet):
    queryset = Snack.objects.all()
    serializer_class = SnackSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
# --- CREATINAS --- #
class CreatinaViewSet(viewsets.ModelViewSet):
    queryset = Creatina.objects.all()
    serializer_class = CreatinaSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
# --- --- --- --- --- #

# --- AMINOÁCIDOS --- #
class AminoacidoViewSet(viewsets.ModelViewSet):
    queryset = Aminoacido.objects.all()
    serializer_class = AminoacidoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
# --- --- --- --- --- #

# --- VITAMINAS SALUD --- #
class VitaminaViewSet(viewsets.ModelViewSet):
    queryset = Vitamina.objects.all()
    serializer_class = VitaminaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]

# --- --- --- --- --- #

# --- CARRITO --- #
class CarritoViewSet(viewsets.ViewSet):
  
    permission_classes = [IsAuthenticated]
   
    def _serializar_carrito(self, carrito):
        """
        Función auxiliar para serializar el carrito y calcular el total.
        Devuelve un diccionario listo para la Response.
        """
        items = carrito.items.all().order_by('-creado')
        
        items_data = []
        total_carrito = 0
        
        for item in items:
            item_total = item.precio * item.cantidad
            items_data.append({
                "id": item.id,
                "producto_id": item.producto_id,
                "nombre": item.nombre,
                "precio": item.precio,
                "cantidad": item.cantidad,
                "imagen": item.imagen,
                "tipo": item.tipo,
                "total": item_total,
            })
            total_carrito += item_total

        return {
            "items": items_data, 
            "total": total_carrito
        }
    
    def get_carrito(self, usuario):
        """Obtiene o crea el carrito para el usuario"""
        carrito, created = Carrito.objects.get_or_create(usuario=usuario)
        return carrito

    def list(self, request):
        carrito = self.get_carrito(request.user)
        
        data_serializada = self._serializar_carrito(carrito)
        
        return Response(data_serializada)

    @action(detail=False, methods=['post'], url_path='agregar')
    def agregar(self, request):
        """Agrega un producto al carrito"""
        data = request.data
        required_fields = ["producto_id", "nombre", "precio", "tipo"]
        
        if not all(field in data for field in required_fields):
            return Response({"error": "Faltan campos obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        producto_id = data["producto_id"]
        tipo = data["tipo"]
        cantidad = int(data.get("cantidad", 1))
        precio = int(data["precio"])

        # Validar cantidad
        if cantidad <= 0:
            return Response({"error": "La cantidad debe ser mayor a 0"}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el producto existe y tiene stock
        producto = self._get_producto(tipo, producto_id)
        if not producto:
            return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Obtener carrito
        carrito = self.get_carrito(request.user)

        # Verificar stock disponible
        cantidad_en_carrito = self._get_cantidad_en_carrito(carrito, producto_id, tipo)
        if cantidad_en_carrito + cantidad > producto.stock:
            disponible = producto.stock - cantidad_en_carrito
            return Response({
                "error": f"Stock insuficiente para {producto.nombre}. Disponible: {max(disponible, 0)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Buscar item existente
        try:
            item_existente = carrito.items.get(producto_id=producto_id, tipo=tipo)
            item_existente.cantidad += cantidad
            item_existente.save()
            
            data_serializada = self._serializar_carrito(carrito)
            
            return Response(data_serializada, status=status.HTTP_200_OK)
            
        except ItemCarrito.DoesNotExist:
            # Crear nuevo item
            ItemCarrito.objects.create(
                carrito=carrito,
                producto_id=producto_id,
                nombre=data["nombre"],
                precio=precio,
                cantidad=cantidad,
                imagen=data.get("imagen", ""),
                tipo=tipo
            )
            
            data_serializada = self._serializar_carrito(carrito)
            
            return Response(data_serializada, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        """Elimina un item del carrito"""
        carrito = self.get_carrito(request.user)
        try:
            item = carrito.items.get(id=pk)
            item.delete()
            
            data_serializada = self._serializar_carrito(carrito)
            
            return Response(data_serializada, status=status.HTTP_200_OK)
            
        except ItemCarrito.DoesNotExist:
            return Response({
                "error": "Producto no encontrado en el carrito"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='actualizar')
    def actualizar_cantidad(self, request):
        """Actualiza la cantidad de un item en el carrito"""
        data = request.data
        item_id = data.get("id")
        nueva_cantidad = int(data.get("cantidad", 1))
        
        if nueva_cantidad <= 0:
            return self.destroy(request, item_id)
        
        carrito = self.get_carrito(request.user)
        try:
            item = carrito.items.get(id=item_id)
            
            # Verificar stock disponible
            producto = self._get_producto(item.tipo, item.producto_id)
            if not producto:
                return Response({"error": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
            # Calcular cantidad de otros items del mismo producto
            cantidad_otros_items = carrito.items.filter(
                producto_id=item.producto_id, 
                tipo=item.tipo
            ).exclude(id=item_id).aggregate(
                total=Sum('cantidad')
            )['total'] or 0
            
            if cantidad_otros_items + nueva_cantidad <= producto.stock:
                item.cantidad = nueva_cantidad
                item.save()
                
                data_serializada = self._serializar_carrito(carrito)
                
                return Response(data_serializada)
                
            else:
                disponible = producto.stock - cantidad_otros_items
                return Response({
                    "error": f"Stock insuficiente. Disponible: {max(disponible, 0)}"
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except ItemCarrito.DoesNotExist:
            return Response({
                "error": "Producto no encontrado en el carrito"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='vaciar')
    def vaciar_carrito(self, request):
        """Vacía completamente el carrito"""
        carrito = self.get_carrito(request.user)
        cantidad_items = carrito.items.count()
        carrito.items.all().delete()
        
        return Response({
            "mensaje": f"Carrito vaciado. Se eliminaron {cantidad_items} productos."
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='resumen')
    def resumen(self, request):
        """Obtiene un resumen del carrito (cantidad de items y total)"""
        carrito = self.get_carrito(request.user)
        cantidad_items = carrito.items.count()
        total_carrito = carrito.items.aggregate(
            total=Sum(models.F('precio') * models.F('cantidad'))
        )['total'] or 0
        
        return Response({
            "cantidad_items": cantidad_items,
            "total": total_carrito
        })

    def _get_producto(self, tipo, producto_id):
        """Obtiene el producto según el tipo"""
        if tipo == "proteina":
            return Proteina.objects.filter(id=producto_id).first()
        elif tipo == "snack":
            return Snack.objects.filter(id=producto_id).first()
        elif tipo == "creatina":
            return Creatina.objects.filter(id=producto_id).first()
        elif tipo == "aminoacido":
            return Aminoacido.objects.filter(id=producto_id).first()
        elif tipo == "vitamina":
            return Vitamina.objects.filter(id=producto_id).first()
        return None

    def _get_cantidad_en_carrito(self, carrito, producto_id, tipo):
        """Calcula la cantidad total de un producto en el carrito"""
        return carrito.items.filter(
            producto_id=producto_id, tipo=tipo
        ).aggregate(total=Sum('cantidad'))['total'] or 0

    @action(detail=False, methods=['post'], url_path='pagar')
    def pagar(self, request):
        """Procesa el pago del carrito"""
        carrito = self.get_carrito(request.user)
        items = carrito.items.all()
        
        if not items:
            return Response({"error": "El carrito está vacío"}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_admin:
            return Response({"error": "Un administrador no puede realizar ventas"}, status=status.HTTP_403_FORBIDDEN)

        # VERIFICAR STOCK ANTES DE PROCESAR EL PAGO
        for item in items:
            producto = self._get_producto(item.tipo, item.producto_id)
            if not producto:
                return Response({
                    "error": f"Producto {item.nombre} no encontrado"
                }, status=status.HTTP_404_NOT_FOUND)
            
            if producto.stock < item.cantidad:
                return Response({
                    "error": f"Stock insuficiente para {producto.nombre}. Disponible: {producto.stock}, Solicitado: {item.cantidad}"
                }, status=status.HTTP_400_BAD_REQUEST)

        # CREAR VENTA
        venta = Venta.objects.create(cliente=request.user, fecha=timezone.now(), total=0)

        try:
            for item in items:
                if item.tipo == "proteina":
                    producto = get_object_or_404(Proteina, pk=item.producto_id)
                    DetalleVenta.objects.create(
                        venta=venta,
                        proteina=producto,
                        cantidad=item.cantidad,
                        precio_unitario=item.precio
                    )
                    # Actualizar stock
                    producto.stock -= item.cantidad
                    producto.save()
                    
                elif item.tipo == "snack":
                    producto = get_object_or_404(Snack, pk=item.producto_id)
                    DetalleVenta.objects.create(
                        venta=venta,
                        snack=producto,
                        cantidad=item.cantidad,
                        precio_unitario=item.precio
                    )
                    # Actualizar stock
                    producto.stock -= item.cantidad
                    producto.save()

            # Recalcular total final
            venta.save(force_recalculate=True)
            
            # Vaciar carrito después de la venta exitosa
            carrito.items.all().delete()
            
            return Response({
                "mensaje": f"Venta realizada con éxito. Folio: {venta.folio}",
                "folio": venta.folio,
                "total": venta.total,
                "fecha": venta.fecha
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Si hay error, revertir la venta
            if venta.pk:
                venta.delete()
            return Response({
                "error": f"Error al procesar la venta: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- --- --- --- --- #

# --- PayPal --- #

class PayPalAPI:
    """Helper para interactuar con la API de PayPal"""
    BASE_URL = "https://api-m.sandbox.paypal.com" # Cambiar a .paypal.com en producción

    def get_access_token(self):
        auth = f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_SECRET_KEY}"
        headers = {
            "Authorization": f"Basic {base64.b64encode(auth.encode()).decode()}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        response = requests.post(f"{self.BASE_URL}/v1/oauth2/token", data="grant_type=client_credentials", headers=headers)
        return response.json()['access_token']

class CrearOrdenPayPal(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        paypal = PayPalAPI()
        token = paypal.get_access_token()
        
        carrito = Carrito.objects.get(usuario=request.user)
        # IMPORTANTE: PayPal NO soporta CLP. Debes convertir a USD.
        # Aquí usamos una tasa fija simple, pero idealmente deberías usar una API de cambio.
        total_clp = carrito.items.aggregate(total=Sum(F('precio') * F('cantidad')))['total'] or 0
        total_usd = round(total_clp * 0.0011, 2) # Ejemplo: 1 CLP = 0.0011 USD

        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "USD",
                    "value": str(total_usd)
                },
                "description": f"Compra en SuplementosPro de {request.user.email}"
            }]
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.post(f"{paypal.BASE_URL}/v2/checkout/orders", json=order_data, headers=headers)
        return Response(response.json())

class CapturarOrdenPayPal(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('orderID')
        paypal = PayPalAPI()
        
        try:
            token = paypal.get_access_token()
        except Exception as e:
            return Response({"error": "Error conectando con PayPal"}, status=500)

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }

        # 1. Capturar el pago en PayPal
        response = requests.post(f"{paypal.BASE_URL}/v2/checkout/orders/{order_id}/capture", headers=headers)
        data = response.json()

        if data.get('status') == 'COMPLETED':
            try:
                with transaction.atomic():
                    # Obtener carrito
                    carrito = Carrito.objects.get(usuario=request.user)
                    items = carrito.items.all()

                    if not items:
                         return Response({"error": "El carrito está vacío"}, status=400)

                    # Crear Venta
                    venta = Venta.objects.create(
                        cliente=request.user, 
                        fecha=timezone.now(), 
                        total=0,
                        folio=order_id # Usamos ID de PayPal como folio
                    )
                    
                    # Helper interno para buscar productos (copiado de tu ViewSet)
                    def get_prod(tipo, pid):
                        if tipo == "proteina": return Proteina.objects.filter(id=pid).first()
                        elif tipo == "snack": return Snack.objects.filter(id=pid).first()
                        elif tipo == "creatina": return Creatina.objects.filter(id=pid).first()
                        elif tipo == "aminoacido": return Aminoacido.objects.filter(id=pid).first()
                        elif tipo == "vitamina": return Vitamina.objects.filter(id=pid).first()
                        return None

                    # Procesar items
                    for item in items:
                        producto = get_prod(item.tipo, item.producto_id)
                        
                        if not producto:
                             raise Exception(f"Producto {item.nombre} no encontrado")

                        if producto.stock < item.cantidad:
                            raise Exception(f"Sin stock para {item.nombre}")

                        # Crear DetalleVenta (Mapeando todos los tipos)
                        DetalleVenta.objects.create(
                            venta=venta,
                            proteina=producto if item.tipo == 'proteina' else None,
                            snack=producto if item.tipo == 'snack' else None,
                            creatina=producto if item.tipo == 'creatina' else None,
                            aminoacido=producto if item.tipo == 'aminoacido' else None,
                            vitamina=producto if item.tipo == 'vitamina' else None,
                            cantidad=item.cantidad,
                            precio_unitario=item.precio
                        )

                        # RESTAR STOCK
                        producto.stock -= item.cantidad
                        producto.save()

                    # Finalizar
                    venta.save(force_recalculate=True)
                    carrito.items.all().delete() # Vaciar carrito
                    
                    enviar_correo_confirmacion(venta)
                    
                    return Response({"status": "success", "venta_id": venta.folio})
            
            except Exception as e:
                # Si falla algo en la BD, se hace rollback automático gracias a transaction.atomic
                return Response({"error": str(e)}, status=500)
        else:
            return Response({"error": "El pago no fue completado en PayPal"}, status=400)
# --- --- #
# --- MercadoPago --- #

class CrearPreferenciaMP(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Validar que el token existe
        access_token = getattr(settings, 'MERCADOPAGO_ACCESS_TOKEN', None)
        if not access_token:
             return Response({"error": "Falta configurar MERCADOPAGO_ACCESS_TOKEN"}, status=500)

        sdk = mercadopago.SDK(access_token)
        
        try:
            carrito = Carrito.objects.get(usuario=request.user)
            items_carrito = carrito.items.all()

            if not items_carrito.exists():
                return Response({"error": "El carrito está vacío"}, status=400)

            items_mp = []
            for item in items_carrito:
                # Validación estricta de tipos de datos
                item_data = {
                    "id": str(item.producto_id),
                    "title": item.nombre,
                    "quantity": int(item.cantidad), # Debe ser entero
                    "currency_id": "CLP", 
                    "unit_price": float(item.precio) # Debe ser número (no string)
                }
                
                # Mercado Pago exige que sea una URL válida (https://...)
                if item.imagen:
                    img_url = item.imagen.strip()
                    
                    # 1. Forzar HTTPS
                    if img_url.startswith("http://"):
                        img_url = img_url.replace("http://", "https://")
                    
                    # 2. Asegurar que es una URL completa de Cloudinary
                    if not img_url.startswith("https://"):
                        # Si guardaste solo el path relativo, reconstrúyelo (opcional, según tu caso)
                        # img_url = f"https://res.cloudinary.com/dhhl65y0g/image/upload/{img_url}"
                        pass

                    # 3. ⚡ TRUCO CLAVE: Forzar extensión .jpg si no la tiene
                    # Cloudinary es mágico: si le pides .jpg, te entrega la imagen en .jpg
                    if not img_url.lower().endswith(('.jpg', '.png', '.jpeg', '.webp')):
                        img_url += ".jpg"

                    # 4. Asignar a Mercado Pago
                    item_data["picture_url"] = img_url
                    #print(f"📸 Imagen final enviada a MP: {img_url}")
                
                items_mp.append(item_data)

                urls_retorno = {
                "success": "https://localhost:5173/pago-exitoso",
                "failure": "https://localhost:5173/pago-fallido",
                "pending": "https://localhost:5173/pago-pendiente"
                }

                preference_data = {
                    "items": items_mp,
                    "payer": {
                        "email": request.user.email or "test_user_123456@testuser.com"
                    },
                    "back_urls": urls_retorno,
                    "auto_return": "approved",
                    "binary_mode": True  # Esto a veces ayuda a forzar decisiones claras (aprobado/rechazado)
                }
                
                print("INTENTO DE PREFERENCIA:", preference_data) # Debug

                preference_response = sdk.preference().create(preference_data)
            
            # --- AQUÍ ESTÁ EL ARREGLO ---
            # Verificamos si la respuesta fue exitosa (Status 201 = Creado)
            if preference_response["status"] == 201:
                preference = preference_response["response"]
                return Response({"preferenceId": preference["id"]})
            else:
                # Si falló, imprimimos el error real en la terminal
                print("❌ ERROR MERCADO PAGO:", preference_response)
                return Response({
                    "error": "Mercado Pago rechazó la solicitud",
                    "detalle": preference_response
                }, status=400)

        except Exception as e:
            print("❌ ERROR INTERNO:", str(e))
            return Response({"error": str(e)}, status=500)

class ConfirmarPagoMP(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_status = request.data.get('status')
        payment_id = request.data.get('payment_id')

        if payment_status != 'approved':
            return Response({"error": "El pago no fue aprobado"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                carrito = Carrito.objects.get(usuario=request.user)
                items = carrito.items.all()
                
                if not items:
                    return Response({"error": "El carrito está vacío o ya fue procesado"}, status=status.HTTP_400_BAD_REQUEST)

                # Validar Stock antes de confirmar
                for item in items:
                    producto = self._get_producto(item.tipo, item.producto_id)
                    if not producto:
                        raise Exception(f"Producto no encontrado: {item.nombre}")
                    if producto.stock < item.cantidad:
                        raise Exception(f"Stock insuficiente para {item.nombre}")

                # Crear Venta
                venta = Venta.objects.create(
                    cliente=request.user, 
                    fecha=timezone.now(), 
                    total=0,
                    id_transaccion=payment_id
                )

                # Mover items y Restar Stock
                for item in items:
                    producto = self._get_producto(item.tipo, item.producto_id)
                    
                    DetalleVenta.objects.create(
                        venta=venta,
                        # AQUI AGREGUÉ TODOS TUS TIPOS DE PRODUCTOS:
                        proteina=producto if item.tipo == 'proteina' else None,
                        snack=producto if item.tipo == 'snack' else None,
                        creatina=producto if item.tipo == 'creatina' else None,
                        aminoacido=producto if item.tipo == 'aminoacido' else None,
                        vitamina=producto if item.tipo == 'vitamina' else None,
                        cantidad=item.cantidad,
                        precio_unitario=item.precio
                    )

                    # RESTAR STOCK
                    producto.stock -= item.cantidad
                    producto.save()

                # Finalizar
                venta.save(force_recalculate=True)
                carrito.items.all().delete()
                
                enviar_correo_confirmacion(venta)

                return Response({
                    "mensaje": "Pago confirmado y stock actualizado", 
                    "venta_id": venta.folio
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Tu helper _get_producto se mantiene igual abajo
    def _get_producto(self, tipo, producto_id):
        if tipo == "proteina": return Proteina.objects.filter(id=producto_id).first()
        elif tipo == "snack": return Snack.objects.filter(id=producto_id).first()
        elif tipo == "creatina": return Creatina.objects.filter(id=producto_id).first()
        elif tipo == "aminoacido": return Aminoacido.objects.filter(id=producto_id).first()
        elif tipo == "vitamina": return Vitamina.objects.filter(id=producto_id).first()
        return None

# --- PEDIDOS USUARIOS --- #
class MisComprasViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = VentaSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return Venta.objects.none()

        # OPTIMIZACIÓN CRÍTICA:
        # Usamos prefetch_related para traer los detalles y los productos 
        # en una sola "ronda" de consultas a la base de datos.
        return Venta.objects.filter(cliente=user)\
            .order_by('-fecha', '-folio')\
            .prefetch_related(
                'detalles', 
                'detalles__proteina',
                'detalles__snack',
                'detalles__creatina',
                'detalles__aminoacido',
                'detalles__vitamina'
            )
# --- --- --- --- #