#!/usr/bin/env bash
# build.sh

set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# Crear superusuario si no existe (USANDO TU MODELO PERSONALIZADO)
echo "from api.models import Usuario; import os; email = os.getenv('ADMIN_EMAIL', 'admin@suplementospro.com'); password = os.getenv('ADMIN_PASSWORD', 'jmapm12a@'); rut = os.getenv('ADMIN_RUT', '12345678-9'); nombre = os.getenv('ADMIN_NAME', 'Administradorcd'); fecha_nacimiento = os.getenv('ADMIN_BIRTHDATE', '2000-01-01'); telefono = os.getenv('ADMIN_PHONE', '+56912345678'); if not Usuario.objects.filter(email=email).exists(): Usuario.objects.create_superuser(email=email, nombre=nombre, password=password, rut=rut, fecha_nacimiento=fecha_nacimiento, telefono=telefono, apellido_paterno='Admin', apellido_materno='System'); print('Superusuario creado exitosamente'); else: print('El superusuario ya existe')" | python manage.py shell