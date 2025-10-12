from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsAdminUser
from rest_framework.response import Response
from django.db import models
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import UsuarioSerializer, UsuarioRegistroSerializer, ProteinaSerializer, SnackSerializer, UsuarioUpdateSerializer
from .serializers import CreatinaSerializer, AminoacidoSerializer, VitaminaSerializer
from .models import Proteina, Snack, Creatina, Aminoacido, Vitamina, Venta, DetalleVenta, Carrito, ItemCarrito, Usuario

Usuario = get_user_model()

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

    def get_carrito(self, usuario):
        """Obtiene o crea el carrito para el usuario"""
        carrito, created = Carrito.objects.get_or_create(usuario=usuario)
        return carrito

    def list(self, request):
        carrito = self.get_carrito(request.user)
        items = carrito.items.all().order_by('-creado')
    
        items_data = []
        total_carrito = 0
        
        for item in items:
            item_total = item.precio * item.cantidad  # O puedes usar item.total si defines la property
            items_data.append({
                "id": item.id,  # ← Ahora es el ID real de la base de datos
                "producto_id": item.producto_id,
                "nombre": item.nombre,
                "precio": item.precio,
                "cantidad": item.cantidad,
                "imagen": item.imagen,
                "tipo": item.tipo,
                "total": item_total,
            })
            total_carrito += item_total

        return Response({
            "items": items_data, 
            "total": total_carrito
        })

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
            
            return Response({
                "mensaje": f"Cantidad actualizada de {producto.nombre}",
                "nueva_cantidad": item_existente.cantidad
            }, status=status.HTTP_200_OK)
            
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
            
            return Response({
                "mensaje": f"{data['nombre']} agregado al carrito"
            }, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        """Elimina un item del carrito"""
        carrito = self.get_carrito(request.user)
        try:
            item = carrito.items.get(id=pk)
            nombre_producto = item.nombre
            item.delete()
            
            return Response({
                "mensaje": f"{nombre_producto} eliminado del carrito"
            }, status=status.HTTP_200_OK)
            
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
                
                return Response({
                    "mensaje": "Cantidad actualizada",
                    "nueva_cantidad": nueva_cantidad,
                    "total_item": item.total
                })
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