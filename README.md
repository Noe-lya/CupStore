# Cup Store

API y servidor web hecho con Node.js y Express para gestionar un catálogo de productos (vasos/tazas) y carritos de compra, con vistas renderizadas en Handlebars.

## Estructura del proyecto

```
api/
  index.js                 # handler serverless que expone la app de Express
src/
  app.js                    # configura Express, Handlebars y las rutas
  config/supabaseClient.js  # cliente de base de datos
  productManager.js         # CRUD de productos
  cartManager.js             # CRUD de carritos
  routes/
    products.router.js      # endpoints REST de productos (/api/products)
    cart.router.js            # endpoints REST de carritos (/api/carts)
    views.router.js           # rutas que renderizan vistas Handlebars
  views/                      # plantillas Handlebars
public/
  js/index.js                # alta/baja de productos en el home
  img/                        # imágenes estáticas
supabase/
  schema.sql                 # script para crear las tablas de la base de datos
```
## Vercel App 
https://cup-store-steel.vercel.app/
