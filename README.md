# RiverMarket

Supermercado de demostración desarrollado únicamente en frontend. Conserva la identidad visual original: turquesa, crema, naranja y las tipografías Fredoka y Nunito.

## Tecnologías permitidas

- React y React DOM para componentes, estado, contexto y navegación con la API History del navegador.
- Bulma como único framework CSS, acompañado de CSS propio para adaptar las tarjetas y la identidad visual.
- GSAP y su integración con React para animaciones. Las transiciones y animaciones CSS de Bulma están desactivadas.
- Vite como herramienta de desarrollo y compilación. **No hay backend, API, base de datos remota ni pasarela de pago.**

Se retiraron las dependencias de Emotion. Las pruebas de la lógica usan el ejecutor incluido en Node, sin librerías adicionales de aplicación.

## Ejecutar

Requiere Node 22.12+ o 24 LTS.

```bash
npm ci
npm run dev
```

Abre la dirección que muestra Vite (normalmente http://localhost:5173).

```bash
npm run lint
npm test
npm run build
npm run preview
```

`dist/` contiene la aplicación estática. El alojamiento debe servir `index.html` como fallback para rutas como `/admin`, `/ingresar` y `/categoria/lacteos`. Vite ya permite abrir y recargar estas rutas durante el desarrollo. Para GitHub Pages en una subcarpeta se requiere configurar la ruta base y el fallback antes de desplegar.

## Cuentas de prueba

Ve a **Mi cuenta** (`/ingresar`). Escribe las credenciales de una de estas cuentas.

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | `cliente@rivermarket.com` | `Cliente123` |
| Administrador | `admin@rivermarket.com` | `Admin123` |

Para demostrar el registro, selecciona **Registrarme** y usa, por ejemplo:

- Nombre: Ana de Prueba
- Correo: `ana@ejemplo.demo`
- Contraseña y confirmación: `Registro123!`

El registro inicia sesión automáticamente y crea un cliente, nunca un administrador. Los correos se comparan sin distinguir mayúsculas. Se validan nombres, contraseñas de al menos 8 caracteres, confirmación y correos repetidos. La recuperación cambia la contraseña local de demostración, sin envío de correos.

## Recorrido de compra

1. Busca cualquier producto del catálogo (por ejemplo, `cafe`, incluso sin tilde) y pulsa Enter o el botón de buscar. El campo se vacía al enviar; el término permanece visible en los resultados. **Limpiar búsqueda** vuelve a los destacados. No se recarga el documento.
2. Explora las categorías. Las mismas tarjetas mantienen dimensiones de imagen, altura y botones alineados, también en móvil. Las imágenes que no cargan tienen un reemplazo visual.
3. Agrega productos: aparece un aviso y se actualiza el contador. Las cantidades no pueden exceder el stock.
4. Abre el carrito. Puedes quitar unidades, eliminar productos o vaciarlo. Si no has iniciado sesión, el acceso a compra te lleva al registro/login y permite retomar el carrito.
5. Pulsa **Finalizar compra**, completa nombre, teléfono de prueba (por ejemplo `3001234567`) y elige recogida en tienda o domicilio. El domicilio requiere ciudad y dirección; las indicaciones son opcionales. Ambas modalidades no tienen costo adicional.
6. Pulsa **Confirmar compra**. Se guarda el pedido, se descuentan existencias, se vacía el carrito y se muestra el comprobante. No se solicitan datos de tarjeta ni se cobra dinero.
7. En **Mi cuenta → Mis pedidos** puedes consultar tus compras, importes y estados.

## Administración

Inicia sesión como administrador y usa **Ir a administración** o el enlace **Administrar** del menú (`/admin`). El acceso de clientes al panel está bloqueado en la interfaz y en las operaciones de gestión.

- **Resumen:** ingresos de ventas confirmadas/entregadas, pedidos, productos, unidades, alertas de stock bajo, ventas de los últimos siete días y pedidos recientes.
- **Productos:** crear, editar, eliminar, buscar, filtrar por categoría y consultar stock bajo, agotados y eliminados. La imagen es una URL HTTPS opcional. El precio se expresa en pesos enteros; el precio anterior solo aplica cuando es mayor al actual.
- **Ventas:** buscar por pedido/cliente, filtrar estado y fechas, consultar detalle y modificar estados. Los totales filtrados excluyen ventas pendientes y canceladas.
- **Historial:** inventario inicial, altas, cambios (incluidos precio y stock), ventas, devoluciones y eliminaciones con responsable, fecha y existencias antes/después. El historial de edición conserva los valores anteriores y nuevos.

Los pedidos pasan de **Pendiente → Confirmada → Entregada**. Los pendientes y confirmados pueden cancelarse con confirmación; la cancelación devuelve el stock una sola vez. Entregada y Cancelada son estados finales. Las compras nuevas se crean como Confirmadas.

Eliminar un producto lo retira del catálogo y evita su compra, pero conserva su registro para que las ventas y el historial sigan siendo consultables. Cambiar el precio o nombre de un producto no altera las líneas de pedidos anteriores.

## Datos y persistencia

La primera visita prepara 33 productos, inventario y 3 pedidos de ejemplo. Hay productos con stock bajo y uno agotado para demostrar esos estados. El usuario cliente de prueba puede ver esos pedidos en su cuenta.

Todo se guarda en `localStorage` del origen actual:

| Clave | Contenido |
| --- | --- |
| `rivermarket_tienda_v1` | Productos, stock, ventas e historial en un solo documento |
| `rivermarket_demo_users` | Usuarios de demostración y contraseñas de prueba |
| `rivermarket_demo_session` | Sesión de demostración |
| `rivermarket_carritos_v2` | Carritos separados por ID de usuario y un carrito de visitante |

El catálogo, las ventas, la sesión y los carritos se actualizan entre pestañas del mismo origen. Antes de confirmar una compra se vuelven a validar precio y disponibilidad. Esta simulación no ofrece transacciones entre dispositivos o concurrencia real de un servidor.

**Usa únicamente datos ficticios.** Las contraseñas y los roles son locales y pueden inspeccionarse o modificarse desde las herramientas del navegador; no constituyen autenticación segura para producción. No hay sincronización entre navegadores o dispositivos. Las fotografías y fuentes originales necesitan conexión a internet.

Para reiniciar la demostración, elimina las cuatro claves anteriores y, si existe, la antigua clave `rivermarket_carrito` en las herramientas de almacenamiento del navegador y recarga. Esto borra las cuentas, compras y cambios locales de prueba. También puedes usar una ventana privada para una demostración independiente.


### Carrito de cada cuenta

Cada cuenta conserva sus productos bajo su ID estable. Al cerrar sesión se cierra el panel, se limpian los datos de la compra pendiente y el visitante ve un carrito vacío. Al volver a iniciar sesión se recupera únicamente el carrito de esa cuenta, también después de recargar. Vaciarlo o finalizar una compra no modifica los carritos de otras cuentas.

Se puede seguir agregando productos como visitante. Al iniciar sesión o registrarse, esos productos se incorporan una sola vez al carrito de la cuenta elegida; los repetidos suman cantidades en una sola línea. Si las cantidades superan el stock vigente, el carrito pide ajustarlas antes de comprar. La sesión y el carrito se sincronizan entre pestañas del mismo navegador.

Al actualizar desde la versión anterior, el carrito global se recupera para la cuenta que tenga una sesión activa. Si no hay sesión, no se puede identificar su propietario: se conserva la antigua clave como respaldo, pero no se muestra ni se entrega a la siguiente cuenta que entre. Una vez creado `rivermarket_carritos_v2`, la aplicación no vuelve a importar ese respaldo.

## Validación

`npm test` cubre compras, totales, descuento de stock, cantidades inválidas, prevención de solicitudes duplicadas, restricciones de administrador, validación de productos, conservación de pedidos históricos, cancelación con devolución única y consistencia del inventario inicial.

Las pruebas de carritos cubren aislamiento entre cuentas, cierre y recuperación de sesión, incorporación del visitante sin duplicados, vaciado independiente, registro, migración y rechazo de datos corruptos.

También se verificaron recorridos en Chromium de búsqueda sin recarga, registro/login, compra, CRUD de productos, filtros, historial, cancelación, persistencia y diseños de escritorio y móvil.


## Información nutricional con Open Food Facts

En **Nutrición** (`/nutricion`) o desde **Conoce lo que llevas** en el inicio se consultan códigos de barras reales. Prueba `3017620422003` (crema de avellanas) o `5449000000996` (Coca-Cola Original); la ficha depende de los datos vigentes del proveedor. Incluye ingredientes, alérgenos, nutrientes por 100 g/100 ml y Nutri-Score cuando están disponibles. No se inventan datos faltantes ni se incorporan productos externos al inventario.

- API pública: `https://world.openfoodfacts.org/api/v2/product/{codigo}.json`, consultada directamente con `fetch` desde React y con CORS. Sin claves, servidor, funciones remotas ni variables de entorno.
- Solo se envía el código, nunca datos del usuario. Las peticiones se hacen al pulsar Consultar, no al escribir.
- Caché en memoria de una hora (hasta 40 fichas), máximo 12 consultas/minuto por instancia, tiempo de espera de 12 segundos, cancelación al navegar y manejo de producto inexistente, datos incompletos, errores de red y HTTP 429. El proveedor aplica sus propios límites por IP.
- Datos bajo ODbL; imágenes bajo CC BY-SA 3.0, con enlaces y atribución en la página. [Documentación oficial](https://openfoodfacts.github.io/openfoodfacts-server/api/).

## Fotografías y movimiento

Se revisaron las 33 fotografías de productos y se reemplazaron 17 imágenes rotas o incongruentes. Las sustituciones se sirven desde `public/catalogo`, con autoría, origen y licencia en `/creditos` y `src/data/imagenesCatalogo.js`. Las fotos de fríjol y queso están identificadas por sus fuentes como cargamanto y queso fresco. Las fotografías ilustran el tipo de producto, no una marca o cantidad exacta del empaque.

La actualización también corrige imágenes antiguas de `localStorage` si todavía coinciden con el enlace original. Conserva imágenes personalizadas, productos, precios, existencias, ventas e historial. El formulario de administración acepta las rutas del catálogo incorporado y URLs HTTPS.

Todas las animaciones se realizan con GSAP: entrada de páginas, formularios, ventanas y pasos del carrito, elevación y acercamiento de tarjetas, pulsación de botones, contador del carrito y respuesta al cursor en la invitación a Nutrición. Se cancelan al desmontar; se respeta `prefers-reduced-motion` y los efectos del cursor se limitan a dispositivos con puntero preciso.

La interfaz usa textos de tienda y cuenta habituales, sin avisos de simulación en el flujo de compra. La autenticación, recuperación de contraseña, administración y compra siguen siendo exclusivamente locales y académicas: no hay seguridad de servidor ni transacciones monetarias reales.

## River, asistente de compras

El botón **¿Te ayudo?** abre el chat en las páginas de la tienda y la cuenta. El administrador conserva su espacio de trabajo sin el panel del asistente.

River funciona en React mediante un motor local de consultas e intenciones. No requiere backend, cuenta de IA, clave ni conexión a un modelo remoto. Una vez cargada la aplicación, las consultas al catálogo y las acciones del carrito funcionan incluso sin conexión; las fotos externas y la API nutricional mantienen sus propios requisitos de conexión. Es un asistente especializado en RiverMarket, no un modelo generativo de conversación general.

Prueba estas consultas:

- `Busco leche`, `¿Cuánto cuesta el fríjol cargamanto?` o `Frutas por menos de 5000`.
- `Ver ofertas` y `Ver más` para recorrer resultados del catálogo vigente.
- `Agrega 2 leches` o, después de consultar productos, `Agrega dos del primero`.
- `Mi carrito`, `Mis pedidos`, `Tienda en Bogotá`, `Horarios`, `Recetas` o `Productos sin gluten`.

Las tarjetas muestran precio, presentación y stock actuales; permiten agregar productos con un clic. Las cantidades se validan y se guardan en una sola operación, sin añadir parcialmente si no hay suficientes existencias. Una selección ambigua pide elegir un producto. Para quitar productos, ajustar cantidades o confirmar una compra, el asistente abre el carrito existente. Los pedidos se filtran por la cuenta activa y no se inventan datos nutricionales, productos ni respuestas ajenas a su alcance.

La conversación se conserva durante la pestaña en `sessionStorage`, bajo `rivermarket_chat_v1:<ID de usuario>` o `rivermarket_chat_v1:invitado`, con un máximo de 40 mensajes. Cambiar de cuenta cierra el chat y selecciona un historial independiente. El botón Reiniciar conversación borra solo ese historial. Si el navegador impide guardar, el chat sigue funcionando en memoria. Ningún mensaje se envía a un servidor.

GSAP anima la apertura, el cierre, la llegada de mensajes y el desplazamiento. Se respeta movimiento reducido, el foco vuelve al botón al cerrar con Escape y el panel se adapta al teclado móvil. Abrir el carrito cierra el chat para que los dos paneles no se superpongan.


## Cuenta, domicilio y seguimiento

El ingreso y registro correctos redirigen al inicio con la sesión activa. El nombre en el menú abre `/cuenta`; `/ingresar` conserva compatibilidad para enlaces anteriores. El panel incluye datos personales, resumen, filtros, búsqueda por número, historial y detalle de cada pedido.

El comprobante incluye resumen y seguimiento, con acceso directo al pedido en la cuenta. Los pedidos anteriores sin modalidad se interpretan como recogida. Administración muestra dirección, ciudad e indicaciones en los domicilios.

El seguimiento es local: usa la fecha guardada del pedido, avanza a preparación a los cinco minutos y a en camino/listo para recoger a los diez. Se actualiza cada quince segundos y conserva el avance al recargar. Los pedidos pendientes no avanzan; cancelaciones y entregas de administración prevalecen. La entrega final requiere marcar el pedido como Entregada en administración. No hay GPS, transportadora, cobros ni servicio de domicilios real.

Validación: `npm run lint`, `npm test` (28 pruebas) y `npm run build`. Las pruebas nuevas cubren domicilio, dirección incompleta, inventario, solicitudes repetidas, seguimiento por tiempo y estados finales.
