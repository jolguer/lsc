# Señas LSC · Prototipo Sprint 1

Prototipo web del proyecto *Plataforma Inteligente de Accesibilidad en Lengua de Señas Colombiana (LSC)*
(UEES · Grupo 6 · Gestión Ágil de Proyectos). Recorre la cadena **Video → Audio → Transcripción → Semántica**
y propone la traducción a glosas LSC con un avatar animado y fichas del Diccionario Básico de la LSC.

> Estado: prototipo **simulado**. No transcribe audio ni genera señas reales (ver Limitaciones).

## Estructura

```
src/index.html          Página (CSP incluida)
src/assets/styles.css   Estilos (modo claro/oscuro, responsive)
src/assets/app.js       Lógica: glosado, pipeline, avatar SVG, sincronía con el video
src/assets/lexicon.js   Léxico de 1.108 señas generado desde el diccionario (window.LEX)
scripts/build.js        Minifica a dist/
scripts/serve.js        Servidor local para probar dist/
tools/build_lexicon.py  Regenera lexicon.js desde el PDF
Dockerfile, nginx.conf  Despliegue en contenedor con cabeceras de seguridad
ESPECIFICACION_PROMPT.md  Especificación con la que se generó esta versión
NOTICE.md               Atribución del diccionario
```

## Uso

```bash
npm install
npm run build      # genera dist/
npm start          # http://localhost:8080
```

Despliegue estático: sube el contenido de `dist/` a cualquier hosting (Netlify, GitHub Pages, S3, nginx).
Con Docker:

```bash
docker build -t senas-lsc .
docker run -p 8080:80 senas-lsc
```

## Regenerar el léxico

```bash
python3 tools/build_lexicon.py ruta/Diccionario-lengua-de-senas.pdf
npm run build
```

Requiere `pdftotext` (poppler-utils).

## Seguridad y rendimiento

- CSP estricta (`script-src 'self'`), `X-Frame-Options`, `nosniff`, sin permisos de cámara ni micrófono.
- El video se reproduce localmente con `blob:`; **no se sube a ningún servidor**.
- Assets con caché de 30 días y `?v=` para invalidar; `index.html` sin caché.
- La tipografía carga desde Google Fonts (con alternativa del sistema). Para uso sin internet, autoaloja la fuente y quita esos dos hosts de la CSP.

## Limitaciones conocidas

- No hay ASR: la frase se escribe a mano. Con video, las señas se reparten uniformemente en su duración.
- Las poses del avatar son ilustrativas; el texto "Cómo se hace" sí es el del diccionario.
- El diccionario es básico (~1.100 señas): lo que no está se deletrea.
- Las glosas por reglas requieren validación de intérpretes de LSC (riesgos R01 y R18 de la matriz).

## Siguientes pasos sugeridos

1. Integrar ASR real (Whisper) con timestamps (HU03) y semántica con LLM (HU04) en un backend, cuidando privacidad (R09).
2. Extraer las fotos del diccionario y asociarlas a cada ficha.
3. Sustituir las poses por movimientos grabados validados (Sprint 3).
4. Revisar derechos de uso del diccionario antes de publicar (ver `NOTICE.md`).
