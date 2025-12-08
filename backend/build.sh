#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# Creación segura de superusuario usando variables de entorno
python manage.py shell -c "
import os
from api.models import Usuario

# Leer credenciales desde variables de entorno
su_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
su_pass = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
su_rut = os.environ.get('DJANGO_SUPERUSER_RUT')

if su_email and su_pass:
    # Eliminar si existe para recrearlo (útil si cambias la pass)
    if Usuario.objects.filter(email=su_email).exists():
        Usuario.objects.filter(email=su_email).delete()
        print(f'Usuario antiguo {su_email} eliminado.')

    Usuario.objects.create_superuser(
        email=su_email,
        password=su_pass,
        rut=su_rut, 
        # Los datos no sensibles pueden quedar fijos o también pasarse a variables
        nombre='Administrador',
        fecha_nacimiento='2000-01-01',
        telefono='+56912345678',
        apellido_paterno='Admin',
        apellido_materno='System'
    )
    print(f'Superusuario {su_email} creado exitosamente.')
else:
    print('AVISO: No se creó superusuario. Faltan variables de entorno.')
"