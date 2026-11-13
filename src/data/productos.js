import { IMAGENES_CATALOGO } from './imagenesCatalogo.js'

const foto = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=85`

const BASE = [
  { id:'banano', nombre:'Banano criollo', presentacion:'Kilo', precio:3200, precioAntes:4200, categoria:'frutas-verduras', imagen:foto('photo-1571771894821-ce9b6c11b08e') },
  { id:'tomate', nombre:'Tomate chonto', presentacion:'Kilo', precio:4800, precioAntes:5900, categoria:'frutas-verduras', imagen:foto('photo-1546094096-0df4bcaaa337') },
  { id:'zanahoria', nombre:'Zanahoria', presentacion:'Kilo', precio:2900, precioAntes:3600, categoria:'frutas-verduras', imagen:foto('photo-1445282768818-728615cc910a') },
  { id:'manzana', nombre:'Manzana roja', presentacion:'Unidad', precio:1800, precioAntes:2200, categoria:'frutas-verduras', imagen:foto('photo-1560806887-1e4cd0b6cbd6') },
  { id:'aguacate', nombre:'Aguacate hass', presentacion:'Unidad', precio:3500, precioAntes:4200, categoria:'frutas-verduras', imagen:foto('photo-1523049673857-eb18f1d7b578') },
  { id:'fresas', nombre:'Fresas frescas', presentacion:'Bandeja 500 g', precio:8500, precioAntes:9900, categoria:'frutas-verduras', imagen:foto('photo-1464965911861-746a04b4bca6') },
  { id:'leche', nombre:'Leche entera', presentacion:'Bolsa 1.000 ml', precio:4300, precioAntes:5100, categoria:'lacteos', imagen:foto('photo-1563636619-e9143da7973b') },
  { id:'huevos', nombre:'Huevos rojos', presentacion:'Cubeta x30', precio:17900, precioAntes:21500, categoria:'lacteos', imagen:foto('photo-1518569656558-1f25e69d93d7') },
  { id:'queso', nombre:'Queso campesino', presentacion:'500 g', precio:14900, precioAntes:18900, categoria:'lacteos', imagen:foto('photo-1486297678162-eb2a19b0a32d') },
  { id:'yogur', nombre:'Yogur natural', presentacion:'1 litro', precio:7900, precioAntes:9200, categoria:'lacteos', imagen:foto('photo-1488477181946-6428a0291777') },
  { id:'mantequilla', nombre:'Mantequilla', presentacion:'Barra 250 g', precio:7200, precioAntes:8500, categoria:'lacteos', imagen:foto('photo-1589985270826-4b7bb135bc9d') },
  { id:'carne', nombre:'Carne molida de res', presentacion:'500 g', precio:15900, precioAntes:19900, categoria:'carnes', imagen:foto('photo-1607623814075-e51df1bdc82f') },
  { id:'pechuga', nombre:'Pechuga de pollo', presentacion:'Kilo', precio:13900, precioAntes:16500, categoria:'carnes', imagen:foto('photo-1604503468506-a8da13d82791') },
  { id:'cerdo', nombre:'Lomo de cerdo', presentacion:'500 g', precio:12500, precioAntes:14900, categoria:'carnes', imagen:foto('photo-1432139555190-58524dae6a55') },
  { id:'pescado', nombre:'Filete de pescado', presentacion:'500 g', precio:18900, precioAntes:22000, categoria:'carnes', imagen:foto('photo-1510130387422-82bed34b37e9') },
  { id:'pan', nombre:'Pan tajado integral', presentacion:'500 g', precio:6900, precioAntes:8200, categoria:'panaderia', imagen:foto('photo-1509440159596-0249088772ff') },
  { id:'croissant', nombre:'Croissant de mantequilla', presentacion:'Unidad', precio:3200, precioAntes:3900, categoria:'panaderia', imagen:foto('photo-1555507036-ab1f4038808a') },
  { id:'arepas', nombre:'Arepas de maíz', presentacion:'Paquete x5', precio:5200, precioAntes:6500, categoria:'panaderia', imagen:foto('photo-1600626333391-0e5f5a7d3f5f') },
  { id:'arroz', nombre:'Arroz blanco', presentacion:'Libra 500 g', precio:2600, precioAntes:3100, categoria:'despensa', imagen:foto('photo-1586201375761-83865001e31c') },
  { id:'frijol', nombre:'Fríjol cargamanto', presentacion:'Libra 500 g', precio:5900, precioAntes:6900, categoria:'despensa', imagen:foto('photo-1515543904379-3d7577f8f2b5') },
  { id:'aceite', nombre:'Aceite vegetal', presentacion:'1 litro', precio:8900, precioAntes:10500, categoria:'despensa', imagen:foto('photo-1474979266404-7eaacbcd87c5') },
  { id:'pasta', nombre:'Pasta spaghetti', presentacion:'Paquete 500 g', precio:3900, precioAntes:4700, categoria:'despensa', imagen:foto('photo-1551183053-bf91a1d81141') },
  { id:'agua', nombre:'Agua natural', presentacion:'Botella 1.5 L', precio:2500, precioAntes:3000, categoria:'bebidas', imagen:foto('photo-1564419320461-6870880221ad') },
  { id:'jugo', nombre:'Jugo de naranja', presentacion:'Botella 1 L', precio:6500, precioAntes:7900, categoria:'bebidas', imagen:foto('photo-1600271886742-f049cd451bba') },
  { id:'cafe', nombre:'Café colombiano', presentacion:'Bolsa 250 g', precio:11900, precioAntes:13900, categoria:'bebidas', imagen:foto('photo-1559056199-641a0ac8b55e') },
  { id:'gaseosa', nombre:'Gaseosa familiar', presentacion:'Botella 1.5 L', precio:5900, precioAntes:6900, categoria:'bebidas', imagen:foto('photo-1543255006-d6395b6f1171') },
  { id:'detergente', nombre:'Detergente en polvo', presentacion:'Bolsa 1 kg', precio:9900, precioAntes:11900, categoria:'aseo', imagen:foto('photo-1585421514738-01798e348b17') },
  { id:'lavaloza', nombre:'Lavaloza líquido', presentacion:'500 ml', precio:5200, precioAntes:6500, categoria:'aseo', imagen:foto('photo-1583947215259-38e31be8751f') },
  { id:'papel', nombre:'Papel higiénico', presentacion:'Paquete x4', precio:7900, precioAntes:9500, categoria:'aseo', imagen:foto('photo-1584556812952-905ffd0c611a') },
  { id:'jabon', nombre:'Jabón de manos', presentacion:'500 ml', precio:6500, precioAntes:7800, categoria:'aseo', imagen:foto('photo-1600857544200-b2f666a9a2ec') },
  { id:'concentrado', nombre:'Alimento para perro', presentacion:'Bolsa 2 kg', precio:18900, precioAntes:21900, categoria:'mascotas', imagen:foto('photo-1589924691995-400dc9ecc119') },
  { id:'gato', nombre:'Alimento para gato', presentacion:'Bolsa 1 kg', precio:12900, precioAntes:14900, categoria:'mascotas', imagen:foto('photo-1582798358481-d199fb7347bb') },
  { id:'arena', nombre:'Arena para gatos', presentacion:'Bolsa 4 kg', precio:15900, precioAntes:18500, categoria:'mascotas', imagen:foto('photo-1601758228041-f3b2795255f1') },
]

export const PRODUCTOS = BASE.map((producto) => ({
  ...producto,
  imagen: IMAGENES_CATALOGO.find((foto) => foto.id === producto.id)?.actual || producto.imagen,
}))

export const PRODUCTOS_DESTACADOS = PRODUCTOS.filter((p) => ['banano','leche','huevos','pan','tomate','queso','zanahoria','carne'].includes(p.id))
