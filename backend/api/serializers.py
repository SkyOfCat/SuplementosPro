from rest_framework import serializers
from .models import Usuario, Proteina, Snack, Venta, DetalleVenta
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Usuario, Carrito, ItemCarrito, Creatina, Aminoacido, Vitamina, PasswordResetToken
from .models import Venta, DetalleVenta, Carrito, ItemCarrito


class UsuarioSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = '__all__'
        read_only_fields = ['id', 'rut', 'is_admin']
    
    def get_nombre_completo(self, obj):
        apellido_materno = obj.apellido_materno or ''
        return f"{obj.nombre} {obj.apellido_paterno} {apellido_materno}".strip()

# ✅ NUEVO: Serializer específico para actualización
class UsuarioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'nombre', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'telefono', 'email', 'direccion',
            'is_admin', 'is_active'
        ]
        # No incluir password, rut, ni campos read-only

    def update(self, instance, validated_data):
        # Actualizar solo los campos permitidos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

# Serializer personalizado para JWT que incluye el nombre
class MiTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agregar campos personalizados al token
        token['nombre'] = user.nombre
        token['email'] = user.email
        token['nombre_completo'] = f"{user.nombre} {user.apellido_paterno}"
        token['is_admin'] = user.is_admin
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Agregar datos del usuario a la respuesta
        data['user'] = {
            'id': self.user.id,
            'nombre': self.user.nombre,
            'email': self.user.email,
            'nombre_completo': f"{self.user.nombre} {self.user.apellido_paterno}",
            'rut': self.user.rut,
            'is_admin': self.user.is_admin
        }
        
        return data

class UsuarioRegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirmar_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = [
            'rut', 'nombre', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'telefono', 'email', 'direccion',
            'password', 'confirmar_password'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, attrs):
        # Remover confirmar_password ya que no existe en el modelo
        attrs.pop('confirmar_password', None)
        
        # Validar que el email sea único
        if Usuario.objects.filter(email=attrs.get('email')).exists():
            raise serializers.ValidationError({"email": "Este email ya está registrado."})
        
        # Validar que el RUT sea único
        if Usuario.objects.filter(rut=attrs.get('rut')).exists():
            raise serializers.ValidationError({"rut": "Este RUT ya está registrado."})
        
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not Usuario.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("No existe un usuario activo con este email.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(min_length=6, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=data['token'], 
                used=False
            )
            if not reset_token.is_valid():
                raise serializers.ValidationError("El token ha expirado o es inválido.")
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Token inválido.")
            
        data['reset_token'] = reset_token
        return data

# --- PRODUCTOS --- #
class ProteinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proteina
        fields = '__all__'
    
    def to_representation(self, instance):
        """Convierte CloudinaryField a URLs strings"""
        representation = super().to_representation(instance)
        
        # Convertir CloudinaryField a URL string
        if instance.imagen:
            representation['imagen'] = instance.imagen.url
        if instance.imagen_nutricional:
            representation['imagen_nutricional'] = instance.imagen_nutricional.url
            
        return representation
        
    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value

class SnackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snack
        fields = '__all__'
     
    def to_representation(self, instance):
        """Convierte CloudinaryField a URLs strings"""
        representation = super().to_representation(instance)
        
        # Convertir CloudinaryField a URL string
        if instance.imagen:
            representation['imagen'] = instance.imagen.url
        if instance.imagen_nutricional:
            representation['imagen_nutricional'] = instance.imagen_nutricional.url
            
        return representation

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value

class CreatinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Creatina
        fields = '__all__'
    
    def to_representation(self, instance):
        """Convierte CloudinaryField a URLs strings"""
        representation = super().to_representation(instance)
        
        # Convertir CloudinaryField a URL string
        if instance.imagen:
            representation['imagen'] = instance.imagen.url
        if instance.imagen_nutricional:
            representation['imagen_nutricional'] = instance.imagen_nutricional.url
            
        return representation

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value

class AminoacidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aminoacido
        fields = '__all__'
    
    def to_representation(self, instance):
        """Convierte CloudinaryField a URLs strings"""
        representation = super().to_representation(instance)
        
        # Convertir CloudinaryField a URL string
        if instance.imagen:
            representation['imagen'] = instance.imagen.url
        if instance.imagen_nutricional:
            representation['imagen_nutricional'] = instance.imagen_nutricional.url
            
        return representation

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value

class VitaminaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vitamina
        fields = '__all__'
    
    def to_representation(self, instance):
        """Convierte CloudinaryField a URLs strings"""
        representation = super().to_representation(instance)
        
        # Convertir CloudinaryField a URL string
        if instance.imagen:
            representation['imagen'] = instance.imagen.url
        if instance.imagen_nutricional:
            representation['imagen_nutricional'] = instance.imagen_nutricional.url
            
        return representation

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value
    
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value

# --- --- --- --- --- #

# --- CARRITO --- #
class CarritoItemSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    producto_id = serializers.IntegerField()
    nombre = serializers.CharField()
    precio = serializers.IntegerField()
    cantidad = serializers.IntegerField()
    imagen = serializers.CharField(allow_null=True, required=False)
    tipo = serializers.CharField()
    total = serializers.IntegerField(read_only=True)

class ItemCarritoSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()
    
    class Meta:
        model = ItemCarrito
        fields = ['id', 'producto_id', 'nombre', 'precio', 'cantidad', 'imagen', 'tipo', 'total', 'creado']
        read_only_fields = ['id', 'creado']

class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True, read_only=True)
    cantidad_items = serializers.SerializerMethodField()
    total_carrito = serializers.SerializerMethodField()
    
    class Meta:
        model = Carrito
        fields = ['usuario', 'creado', 'actualizado', 'items', 'cantidad_items', 'total_carrito']
        read_only_fields = ['usuario', 'creado', 'actualizado']
    
    def get_cantidad_items(self, obj):
        return obj.items.count()
    
    def get_total_carrito(self, obj):
        return sum(item.total for item in obj.items.all())
# --- --- --- --- --- #

# --- DETALLE VENTA --- #
class DetalleVentaSerializer(serializers.ModelSerializer):
    nombre_producto = serializers.SerializerMethodField()
    
    class Meta:
        model = DetalleVenta
        # Agregamos 'id' por si React necesita una key única
        fields = ['id', 'cantidad', 'precio_unitario', 'subTotal', 'nombre_producto']

    def get_nombre_producto(self, obj):
        # Esta lógica está bien, pero depende de que los modelos relacionados existan
        producto = obj.get_producto() 
        try:
            return producto.nombre if producto else "Producto no disponible"
        except AttributeError:
            return "Error en nombre de producto"

class VentaSerializer(serializers.ModelSerializer):
    # Usamos source='detalleventa_set' porque no definiste related_name en el modelo
    detalles = DetalleVentaSerializer(many=True, read_only=True)

    class Meta:
        model = Venta
        fields = ['folio', 'id_transaccion', 'fecha', 'total', 'detalles']

# --- --- --- --- --- #