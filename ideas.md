# Ideas de Diseño — NutritionFC

## Idea 1: Sport-Lab Precision
<response>
<text>
**Design Movement**: Industrial Minimalism + Sports Science Aesthetic
**Core Principles**: Datos como protagonistas, contraste extremo negro/blanco/cian, tipografía técnica de laboratorio, jerarquía numérica clara.
**Color Philosophy**: Negro profundo (#0A0A0A) como base, blanco puro para datos críticos, cian eléctrico (#00D4FF) como acento de marca — exactamente el azul del logo NutritionFC. Rojo coral para alertas y déficit calórico.
**Layout Paradigm**: Panel lateral fijo con progreso del formulario, contenido principal en columna central ancha. Cada paso del formulario ocupa toda la pantalla con transición de slide horizontal.
**Signature Elements**: Barras de progreso numéricas estilo "Step 3/7", tarjetas de datos con bordes izquierdos de color (indicador de categoría), tablas con fondo alternado muy sutil.
**Interaction Philosophy**: Cada input tiene feedback visual inmediato. Los cálculos aparecen en tiempo real con animación de contador numérico.
**Animation**: Slide horizontal entre pasos del formulario, fade-in de resultados calculados, contador animado para kcal y macros.
**Typography System**: `Barlow Condensed` para títulos y números grandes (bold, uppercase), `DM Sans` para cuerpo de texto y labels.
</text>
<probability>0.08</probability>
</response>

## Idea 2: Athletic Dashboard — Elegancia Oscura
<response>
<text>
**Design Movement**: Dark Mode Sports Dashboard + Editorial Typography
**Core Principles**: Fondo oscuro carbón, datos en primer plano luminoso, sensación de app profesional de nutrición deportiva, flujo de wizard con sidebar de navegación.
**Color Philosophy**: Fondo carbón (#111827), superficies de tarjeta en gris oscuro (#1F2937), cian brillante del logo (#38BDF8) como color primario de acción, verde lima (#84CC16) para métricas positivas, naranja (#F97316) para advertencias.
**Layout Paradigm**: Sidebar izquierdo con pasos del wizard numerados y estado (completado/activo/pendiente). Área principal con formulario de paso actual. Header con logo y progreso global.
**Signature Elements**: Indicadores circulares de progreso para macros (donut charts), tarjetas de métricas con iconos grandes, pills de estado de color.
**Interaction Philosophy**: El sidebar muestra en tiempo real qué pasos están completos. Los resultados se revelan progresivamente conforme el usuario avanza.
**Animation**: Transición de fade+scale entre pasos, números que cuentan hacia arriba al calcularse, barras de macros que se llenan animadas.
**Typography System**: `Space Grotesk` para títulos y datos numéricos, `Inter` para texto de cuerpo y formularios.
</text>
<probability>0.07</probability>
</response>

## Idea 3: Clean Sports White — Formulario Médico-Deportivo
<response>
<text>
**Design Movement**: Medical-Sport Clean + Swiss Grid
**Core Principles**: Fondo blanco limpio, acentos en negro y cian del logo, sensación de herramienta profesional de nutricionista, formulario tipo wizard con steps claros.
**Color Philosophy**: Blanco (#FFFFFF) y gris muy claro (#F8FAFC) para fondos, negro (#0F172A) para texto principal, cian (#0EA5E9) del logo como acento, verde (#10B981) para valores óptimos.
**Layout Paradigm**: Wizard centrado con indicador de pasos en la parte superior. Cada paso tiene un título grande, descripción breve y los inputs necesarios. Resultados en cards a la derecha o debajo.
**Signature Elements**: Step indicator horizontal con línea conectora, cards de resultado con valor grande y unidad pequeña, tabla de macros con barras de porcentaje de color.
**Interaction Philosophy**: Validación en tiempo real, tooltips de ayuda en campos complejos, imágenes de referencia de % graso en modal.
**Animation**: Progress bar que avanza, resultados que aparecen con fade, hover suave en cards.
**Typography System**: `Raleway` para títulos (bold, como en el logo), `Source Sans 3` para cuerpo de texto.
</text>
<probability>0.09</probability>
</response>

---

## Decisión: Idea 2 — Athletic Dashboard Oscuro

Se elige la **Idea 2** por su coherencia con la identidad de marca NutritionFC (logo negro/cian), su capacidad para mostrar datos numéricos complejos de forma clara, y su sensación de herramienta profesional para deportistas. El sidebar de navegación facilita la navegación entre secciones (Calorías → Macros → Menú A → Menú B → Día de Partido) que es exactamente lo que pide el usuario.
