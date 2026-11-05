const imagen = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=85`

export const CATEGORIAS = [
  { id:'frutas-verduras', imagen:imagen('photo-1542838132-92c53300491e'), nombre:'Frutas y verduras', detalle:'Frescas cada día' },
  { id:'lacteos', imagen:imagen('photo- dairy'), nombre:'Lácteos y huevos', detalle:'Leche, queso y yogur' },
  { id:'carnes', imagen:imagen('photo-1607623814075-e51df1bdc82f'), nombre:'Carnes y pescado', detalle:'Cortes de calidad' },
  { id:'panaderia', imagen:imagen('photo-1509440159596-0249088772ff'), nombre:'Panadería', detalle:'Recién horneado' },
  { id:'despensa', imagen:imagen('photo-1547592180-85f173990554'), nombre:'Despensa', detalle:'Granos, enlatados y aceites' },
  { id:'bebidas', imagen:imagen('photo-1544145945-f90425340c7e'), nombre:'Bebidas', detalle:'Jugos, gaseosas y agua' },
  { id:'aseo', imagen:imagen('photo-1585421514738-01798e348b17'), nombre:'Aseo y hogar', detalle:'Limpieza y cuidado' },
  { id:'mascotas', imagen:imagen('photo-1589924691995-400dc9ecc119'), nombre:'Mascotas', detalle:'Alimento y accesorios' },
]
