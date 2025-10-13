#!/usr/bin/env bash
# build.sh

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# Crear superusuario simple (sin variables de entorno)
python manage.py shell -c "
from api.models import Usuario
if not Usuario.objects.filter(email='admin@suplementospro.com').exists():
    Usuario.objects.create_superuser(
        email='admin@suplementospro.com',
        nombre='Administrador', 
        password='jmapm12a@',
        rut='12345678-9',
        fecha_nacimiento='2000-01-01',
        telefono='+56912345678',
        apellido_paterno='Admin',
        apellido_materno='System'
    )
    print('Superusuario creado')
else:
    print('Superusuario ya existe')
"