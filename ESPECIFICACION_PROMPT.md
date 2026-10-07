# Especificación / prompt de generación — Señas LSC (versión final)

Documento para regenerar el proyecto con un asistente de IA. Pega las secciones 1 a 9 como instrucción
y adjunta el PDF *Diccionario Básico de la LSC* (INSOR / Instituto Caro y Cuervo, 2006).

## 1. Contexto
Proyecto universitario UEES · Grupo 6 · Gestión Ágil de Proyectos. MVP que transforma contenido hablado en
español colombiano en contenido accesible en Lengua de Señas Colombiana (LSC). El **Sprint 1** valida la cadena
Video → Audio → Speech-to-Text/IA → Comprensión semántica (HU01 a HU04). El entregable es un **prototipo
simulado**, moderno y práctico, de una sola página sin backend.

## 2. Interfaz
- Español, sentido común UX: verbos claros ("Traducir a LSC", "Reproducir", "Pausar").
- Entrada: cuadro de texto (frase por defecto: "Hoy vamos a hablar sobre la importancia de la inclusión") y
  carga opcional de video local (`<input type=file accept="video/*">`).
- Pipeline visual de 4 pasos con estados pendiente / en curso / hecho: Carga de video (HU01), Audio 16 kHz (HU02),
  Transcripción (HU03), Semántica (HU04). Animación de ~550 ms por paso.
- **El video debe visualizarse** en un reproductor con controles apenas se carga (URL `blob:`, nunca se sube).
- Resultado: panel de intérprete, ficha de la seña, secuencia de glosas, significado estructurado y JSON.
- Responsive (rejilla de 2 columnas que pasa a 1 bajo 720 px), foco visible, `prefers-reduced-motion`,
  modo claro y oscuro con botón "Tema".
- Identidad: colores UEES. Claro: fondo `#f6f3f4`, tarjeta `#fff`, tinta `#241820`, marca `#7b1230` / `#a3174a`,
  suave `#f1e3e8`. Oscuro: fondo `#171014`, tarjeta `#221821`, marca `#e0577f` / `#f08aa8`. Tipografía
  Bricolage Grotesque con alternativa del sistema.

## 3. Avatar intérprete (SVG, sin imágenes)
- Reemplaza cualquier emoji de mano. Cabeza con cejas y boca, torso, **dos brazos articulados** (hombro, codo,
  mano con pulgar y 4 dedos) en `viewBox="-10 0 220 250"`. Hombro en (64,146), brazo 42, antebrazo 38; el
  segundo brazo se dibuja espejado con `translate(200 0) scale(-1 1)`.
- Animación con `requestAnimationFrame` e interpolación suave (factor 0,14 para ángulos, 0,2 para dedos), leve
  cabeceo, cejas arriba en preguntas, boca abierta en HABLAR y oscilación de codo (onda) por pose.
- Formas de mano: relax, open, flat, fist, point, ily (longitudes de dedos).
- Poses propias (ángulos hombro/codo, mano, cejas, boca, onda) para HOLA, HOY, HABLAR, GRACIAS, IMPORTANTE,
  INCLUSIÓN, PREGUNTA, QUERER, AYUDA; el resto usa 5 poses genéricas elegidas por hash de la palabra.
- Con video cargado el avatar va en una **ventana flotante (PiP)** arriba a la derecha (38 % de ancho, máx. 210 px)
  y cambia de seña al ritmo del video (`timeupdate`): seña = floor(tiempo / duración × n). Al terminar vuelve a reposo.
- Aviso honesto: las poses son ilustrativas, no LSC oficial.

## 4. Diccionario (datos reales)
- Extraer del PDF (`pdftotext`) las entradas: palabra, categoría (n., v., adj., adv., loc., pron., conj., prep.),
  definición, glosa de ejemplo y descripción de cómo se hace la seña. Resultado: 1.116 entradas, 1.108 claves.
- Clave de búsqueda: minúsculas, sin tildes, sin signos; entradas `A/B` generan dos claves.
- Se incrusta como `window.LEX = { clave: [palabra, cat, definición, glosa, descripción] }`.

## 5. Reglas de glosado (Anexo 2 del diccionario)
- Palabras vacías (no se señan): a al de del el la las los lo un una unos unas y o en con por para que se es son
  sobre vamos va voy está esta están estan estoy hay era fue soy eres.
- Lematización básica: mapa manual (importancia→IMPORTANTE, quiero→QUERER, doctor→MÉDICO, etc.) y candidatos
  por terminación (-amos/-emos/-imos, -an/-en, -o, -a, -es, -s → ar/er/ir).
- Si hay entrada: se usa la glosa oficial en mayúscula. Si no: **deletreo** letra a letra con guiones (P-E-R-A).
- Orden: marcadores de tiempo (HOY, MAÑANA, AYER) primero; PREGUNTA al final si hay "?".
- Significado estructurado: tema (último concepto), concepto clave (el más largo), intención
  (Preguntar / Agradecer / Saludar / Informar), elementos y JSON con transcripción y glosas.
- Durante la reproducción, ficha con la seña actual: categoría, definición, "Cómo se hace" y ejemplo LSC.
  Indicador de cobertura "N de M señas tienen entrada en el diccionario".

## 6. Requisitos de producción
- Archivos separados: `index.html`, `styles.css`, `app.js`, `lexicon.js`; sin dependencias en tiempo de ejecución.
- CSP: `script-src 'self'`; estilos propios + Google Fonts; `media-src 'self' blob:`; `object-src 'none'`.
- Build con terser y csso a `dist/`; Dockerfile multi-etapa (node → nginx); nginx con gzip, caché de assets
  y cabeceras de seguridad (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- README, NOTICE con atribución del diccionario y `tools/build_lexicon.py` reproducible.

## 7. Qué NO hace (declararlo en la interfaz y el README)
No transcribe audio (la frase se escribe), no analiza el video, no genera LSC real, y las glosas necesitan
validación de personas intérpretes (riesgos R01 y R18).

## 8. Criterios de aceptación
1. Al subir un video se ve y se reproduce.
2. Al pulsar "Traducir a LSC" el pipeline avanza y aparecen glosas, ficha y significado.
3. El avatar cambia de pose con cada seña y sigue el video.
4. "Mañana quiero comprar jabón y agua" → MAÑANA QUERER COMPRAR JABÓN AGUA.
5. "inclusión" se deletrea (I-N-C-L-U-S-I-Ó-N) y se marca con borde punteado.
6. `npm run build` genera `dist/` sin errores y la CSP no bloquea ningún recurso.

## 9. Historial de iteraciones que llevaron a esta versión
1. Prototipo de interfaz con pipeline y glosas por reglas, emoji de mano.
2. Video visible y ventana PiP sincronizada.
3. Emoji sustituido por avatar SVG articulado.
4. Integración del diccionario oficial y deletreo de palabras sin entrada.
5. Empaquetado para producción (esta entrega).
