from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.validators import MinValueValidator
from django.forms import ValidationError
from cloudinary.models import CloudinaryField
import uuid
from datetime import timedelta
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    def create_user(self, email, nombre, password=None, **extra_fields):
        if not email:
            raise ValueError('El usuario debe tener un email')
        email = self.normalize_email(email)
        user = self.model(email=email, nombre=nombre, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre, password=None, **extra_fields):
        extra_fields.setdefault('is_admin', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_admin') is not True:
            raise ValueError('El superusuario debe tener is_admin=True.')
        
        return self.create_user(email, nombre, password, **extra_fields)

class Usuario(AbstractBaseUser):
    id = models.AutoField(primary_key=True, db_column='idUsuario')
    rut = models.CharField(max_length=10, unique=True, db_index=True)
    nombre = models.CharField(max_length=20, db_index=True)
    apellido_paterno = models.CharField(max_length=20)
    apellido_materno = models.CharField(max_length=20, blank=True)
    fecha_nacimiento = models.DateField()
    telefono = models.CharField(max_length=45)
    email = models.EmailField(unique=True, max_length=100, blank=True, null=True, db_index=True)
    direccion = models.CharField(max_length=50, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
        
    objects = UsuarioManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'rut', 'fecha_nacimiento']
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.nombre} {self.apellido_paterno}"
    
    def has_perm(self, perm, obj=None):
        # Los administradores tienen todos los permisos
        return self.is_admin
    
    def has_module_perms(self, app_label):
        return self.is_admin
    
    @property
    def is_staff(self):
        return self.is_admin 

class PasswordResetToken(models.Model):
    user = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    
    def is_valid(self):
        # El token expira después de 24 horas
        return not self.used and (timezone.now() - self.created_at) < timedelta(hours=24)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Token de recuperación'
        verbose_name_plural = 'Tokens de recuperación'
    
    def __str__(self):
        return f"Token para {self.user.email} - {'Válido' if self.is_valid() else 'Expirado'}"

# --- PRODUCTOS --- #
class Proteina(models.Model):
    id = models.AutoField(primary_key=True, db_column='idProteina')
    nombre = models.CharField(max_length=45, db_index=True)
    sabor = models.CharField(max_length=45)
    tipo_proteina = (
        ('Whey','Whey Protein'),
        ('Isolate','Isolate Protein'),
        ('Casein','Casein Protein')
    )
    tipo = models.CharField(max_length=20, choices=tipo_proteina, db_index=True)
    fecha_vencimiento = models.DateField()
    peso = models.CharField(max_length=30)
    precio = models.PositiveIntegerField()
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    imagen = CloudinaryField(
        'imagen', 
        folder='suplementospro/productos/proteinas')
    imagen_nutricional = CloudinaryField(
        'imagen_nutricional',
        folder='suplementospro/productos/proteinas/info_nutricional')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'proteinas'
        verbose_name = 'Proteina'
        verbose_name_plural = 'Proteinas'

    def __str__(self):
        return f"{self.nombre} - {self.tipo}"

class Snack(models.Model):
    id = models.AutoField(primary_key=True, db_column='idSnack')
    nombre = models.CharField(max_length=45, db_index=True)
    sabor = models.CharField(max_length=45)
    tipo_producto = models.CharField(max_length=20, default='Snack') 
    tipo = models.CharField(max_length=20, default='Snack')  
    fecha_vencimiento = models.DateField()
    precio = models.PositiveIntegerField()
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    imagen = CloudinaryField(
        'imagen',
        folder='suplementospro/productos/snacks')
    imagen_nutricional = CloudinaryField(
        'imagen_nutricional',
        folder='suplementospro/productos/snacks/info_nutricional')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'snacks'
        verbose_name = 'Snack'
        verbose_name_plural = 'Snacks'

    def __str__(self):
        return f"{self.nombre} - {self.stock}"

# --- CREATINA --- #
class Creatina(models.Model):
    id = models.AutoField(primary_key=True, db_column='idCreatina')
    nombre = models.CharField(max_length=45, db_index=True)
    tipo_producto = models.CharField(max_length=20, default='Creatina')
    tipo = models.CharField(max_length=20, default='Creatina')
    fecha_vencimiento = models.DateField()
    precio = models.PositiveIntegerField()
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    imagen = CloudinaryField(
        'imagen',
        folder='suplementospro/productos/creatinas')
    imagen_nutricional = CloudinaryField(
        'imagen_nutricional',
        folder='suplementospro/productos/creatinas/info_nutricional')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'creatinas'
        verbose_name = 'Creatina'
        verbose_name_plural = 'Creatinas'
    
    def __str__(self):
        return f"{self.nombre} - {self.stock}"
# --- --- --- --- --- #

# --- AMINOÁCIDOS --- #
class Aminoacido(models.Model):
    id = models.AutoField(primary_key=True, db_column='idAminoacido')
    nombre = models.CharField(max_length=45, db_index=True)
    tipo_producto = models.CharField(max_length=20, default='Aminoacido')
    tipo = models.CharField(max_length=20, default='Aminoacido')
    fecha_vencimiento = models.DateField()
    precio = models.PositiveIntegerField()
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    imagen = CloudinaryField(
        'imagen',
        folder='suplementospro/productos/aminoacidos')
    imagen_nutricional = CloudinaryField(
        'imagen_nutricional',
        folder='suplementospro/productos/aminoacidos/info_nutricional')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'aminoacidos'
        verbose_name = 'Aminoacido'
        verbose_name_plural = 'Aminoacidos'
    
    def __str__(self):
        return f"{self.nombre} - {self.stock}"
# --- --- --- --- --- #

# --- VITAMINAS-SALUD --- #
class Vitamina(models.Model):
    id = models.AutoField(primary_key=True, db_column='idVitamina')
    nombre = models.CharField(max_length=45, db_index=True)
    tipo_producto = models.CharField(max_length=20, default='Vitamina')
    tipo = models.CharField(max_length=20, default='Vitamina')
    fecha_vencimiento = models.DateField()
    precio = models.PositiveIntegerField()
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    imagen = CloudinaryField(
        'imagen',
        folder='suplementospro/productos/vitaminas')
    imagen_nutricional = CloudinaryField(
        'imagen_nutricional',
        folder='suplementospro/productos/vitaminas/info_nutricional')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vitaminas'
        verbose_name = 'Vitamina'
        verbose_name_plural = 'Vitaminas'
    
    def __str__(self):
        return f"{self.nombre} - {self.stock}"
# --- --- --- --- --- #

# --- VENTAS --- #
class Venta(models.Model):
    folio = models.AutoField(primary_key=True, db_column='idFolio')
    id_transaccion = models.CharField(max_length=100, null=True, blank=True, db_column='idTransaccion') # Mercado Pago
    fecha = models.DateField(auto_now_add=True) 
    cliente = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='idCliente', limit_choices_to={'is_admin': False})
    total = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'ventas'
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'

    def __str__(self):
        return f"Folio: {self.folio} - {self.cliente.nombre}"
    
    def calcular_total(self):
        detalles = self.detalleventa_set.all()
        return sum(detalle.subTotal for detalle in detalles) if detalles.exists() else 0  
      
    def save(self, *args, **kwargs):
        force_recalculate = kwargs.pop('force_recalculate', False)
        
        if self.pk and (not self.total or force_recalculate):
            self.total = self.calcular_total()
            
        super().save(*args, **kwargs)
        
# --- --- --- --- --- #

# --- DETALLE VENTAS --- #
class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, db_column='idVenta', related_name='detalles')
    proteina = models.ForeignKey(Proteina, on_delete=models.CASCADE, null=True, blank=True, db_column='idProteina')
    snack = models.ForeignKey(Snack, on_delete=models.CASCADE, null=True, blank=True, db_column='idSnack')
    creatina = models.ForeignKey(Creatina, on_delete=models.CASCADE, null=True, blank=True, db_column='idCreatina')
    aminoacido = models.ForeignKey(Aminoacido, on_delete=models.CASCADE, null=True, blank=True, db_column='idAminoacido')
    vitamina = models.ForeignKey(Vitamina, on_delete=models.CASCADE, null=True, blank=True, db_column='idVitamina')
    
    cantidad = models.IntegerField(validators=[MinValueValidator(1)])
    precio_unitario = models.PositiveIntegerField()
    subTotal = models.PositiveIntegerField()

    class Meta:
        db_table = 'detalles_ventas'
        verbose_name = 'Detalle de Venta'
        verbose_name_plural = 'Detalles de Venta'

    def __str__(self):
        producto = self.get_producto()
        nombre_producto = producto.nombre if producto else "Producto no disponible"
        return f"Venta {self.venta.folio} - {nombre_producto}"
    
    def save(self, *args, **kwargs):
        self.subTotal = self.cantidad * self.precio_unitario
        update_venta = kwargs.pop('update_venta_total', True)
        super().save(*args, **kwargs)
        if update_venta:
            self.venta.save(force_recalculate=True)
        
    def clean(self):
        if not (bool(self.proteina) ^ bool(self.snack) ^ bool(self.creatina) ^ bool(self.aminoacido) ^ bool(self.vitamina)):
            raise ValidationError('Debe seleccionar un producto (proteína o snack o creatina o aminoácido o vitamina)')

    def get_producto(self):
        return self.proteina or self.snack or self.creatina or self.aminoacido or self.vitamina

# --- --- --- --- --- #

# --- CARRITO --- #
class Carrito(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, db_column='idUsuario')
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carritos'
        verbose_name = 'Carrito'
        verbose_name_plural = 'Carritos'

    def __str__(self):
        return f"Carrito de {self.usuario.nombre}"

class ItemCarrito(models.Model):
    id = models.AutoField(primary_key=True, db_column='idItemCarrito')
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, db_column='idCarrito', related_name='items')
    producto_id = models.IntegerField()
    nombre = models.CharField(max_length=255)
    precio = models.PositiveIntegerField()
    cantidad = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    imagen = models.CharField(max_length=500, blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=[
        ('proteina', 'Proteina'), 
        ('snack', 'Snack'), 
        ('creatina', 'Creatina'),
        ('aminoacido', 'Aminoacido'),
        ('vitamina', 'Vitamina')
        ]
                            )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'items_carrito'
        verbose_name = 'Item de Carrito'
        verbose_name_plural = 'Items de Carrito'
        unique_together = ['carrito', 'producto_id', 'tipo']

    def __str__(self):
        return f"{self.nombre} x{self.cantidad}"

    @property
    def total(self):
        return self.precio * self.cantidad

    def save(self, *args, **kwargs):
        # Validar que la cantidad sea positiva
        if self.cantidad < 1:
            raise ValidationError("La cantidad debe ser al menos 1")
        super().save(*args, **kwargs)