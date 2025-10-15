Proyecto de página web "SuplementosPro" full-stack.

Página donde los clientes pueden comprar productos, ver la historia del equipo de desarrollo y ver sus pedidos y perfil (Proximamente...)
Se debe agregar un procesos de pago (mercado pago o stripe (recomendado) )

Se ocupo Render (backend) donde también esta alojada la base de datos relacional (postgresql) y se uso Netlify (frontend).
También se uso Cloudinary para guardar imágenes de productos en la nube.

Los administradores al iniciar sesión tendrán acceso exclusivo a un CRUD para los productos, cómo para los usuarios registrados.

* Administradores:
  - Pueden borrar, agregar, modificar productos del inventario
  - Pueden borrar, agregar, modificar usuarios registrados (pueden dar permisos de administración si quieren y no pueden borrar la cuenta que estan usando en ese momento).
  - Los administradores no pueden comprar.

* Clientes
  - Pueden acceder a funciones básicas (ver historia del equipo de desarrollo, ver productos disponibles y ver carrito de productos seleccionados para su compra).
  - En un futuro se agregará la función ver perfil y historial de pedidos.

Los productos disponibles son (Proteinas "Whey, Isolated, Casein", Snack, Creatina, Aminoácidos, Vitaminas) todos incluyendo su información nutricional.
