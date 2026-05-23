# Control de vehículos — plan de la web

Una app de una sola página para gestionar tu flota personal o de empresa.

---

## Vistas principales

### 1. Dashboard
Resumen general de toda la flota. Incluye alertas activas, próximos vencimientos y estadísticas rápidas por vehículo.

### 2. Mis vehículos
Listado en tarjetas por vehículo con matrícula, marca, modelo, año y foto. Acceso al detalle de cada uno.

### 3. Mantenimientos
Historial de revisiones, cambios de aceite, ITV y cualquier intervención. Cada registro incluye fecha, descripción y coste.

### 4. Documentos
Almacén de seguro, ITV y ficha técnica con fecha de caducidad y aviso configurable con antelación.

### 5. Repostajes
Registro de combustible por repostaje: litros, precio por litro, importe total y km en el momento. Consumo medio calculado automáticamente.

### 6. Gastos
Totales agrupados por vehículo y categoría. Gráfica mensual y opción de exportación.

---

## Datos de cada vehículo

### Identificación
- Matrícula
- VIN / número de bastidor
- Marca y modelo
- Año de fabricación
- Color
- Tipo de combustible

### Kilometraje
- Registro histórico de km
- Proyección de próximo servicio basada en km

### Alertas
Avisos configurables por:
- Fecha de ITV
- Vencimiento del seguro
- Próxima revisión (por fecha o km)
- Cambio de aceite

### Fotos
- Galería de imágenes del vehículo
- Recibos y facturas escaneadas

---

## Estados y etiquetas

| Estado | Descripción |
|---|---|
| ✅ Al día | Documentación y revisiones en regla |
| ⚠️ Vence pronto | Caducidad próxima (configurable, ej. 30 días) |
| 🔴 Caducado | Documento o revisión vencida |
| ⬜ Inactivo | Vehículo fuera de uso temporalmente |
| 📅 Cita programada | Revisión o gestión agendada |

---

## Funcionalidades extra sugeridas

- Multiusuario / compartir vehículo entre conductores
- Exportar datos a PDF o Excel
- Notificaciones por email ante vencimientos
- Dark mode
- Modo offline / PWA instalable
- Escáner de matrícula para alta rápida

---

## Notas para el sistema de diseño

- La unidad mínima de contenido es la **tarjeta de vehículo** — es el componente central a partir del que derivan los demás.
- Los **estados** (al día, vence pronto, caducado) deben tener representación visual consistente: color, icono y etiqueta de texto.
- El **dashboard** es una composición de widgets reutilizables: resumen de flota, próximos vencimientos, últimos gastos.
- Las vistas de **mantenimiento, repostajes y documentos** comparten el mismo patrón: lista cronológica + formulario de alta.
- Considerar breakpoints para uso en móvil (consulta rápida en gasolinera o taller).
