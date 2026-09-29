# Web académica de Miguel Ángel Berbel · v3

## Qué contiene este proyecto

Una web estática de cinco páginas: Home, Research, Events, Teaching y CV.
El diseño es propio; no utiliza un tema descargado ni necesita React, una base
de datos externa o un servidor propio. Hugo transforma los datos y las
plantillas en HTML. Un pequeño JavaScript se ocupa del menú móvil,
los filtros y las citas BibTeX. Los artículos ya están en el HTML y son
legibles aunque JavaScript esté desactivado.

**Estado:** prototipo funcional y proyecto preparado para despliegue, no sitio
publicado. Se han probado los HTML, el JavaScript y las plantillas con un
intérprete local de Go. En este entorno no estaba disponible el ejecutable
Hugo ni una conexión autorizada a tu GitHub: el primer build real de Hugo,
la integración con Pages CMS y la publicación deben comprobarse al
conectar el repositorio. No se ha creado ninguna cuenta, comprado ningún
dominio ni publicado tus datos.

## Alojamiento, construcción y edición

| Tarea | Herramienta | Para qué sirve |
| --- | --- | --- |
| Guardar contenido y código | Repositorio GitHub | Una copia versionada de la web. |
| Construir la web | Hugo, ejecutado por GitHub Actions | Genera las páginas al guardar cambios. |
| Publicar | GitHub Pages | Aloja los archivos generados. |
| Editar habitualmente | Pages CMS | Formularios de artículos, eventos, portada, docencia y CV. |

A fecha de consulta (29-09-2026), GitHub Pages admite repositorios públicos
con GitHub Free; usar repositorios privados para Pages requiere un plan que
lo permita. Pages CMS anuncia gratuita también su versión alojada.
Un dominio propio es opcional y su registro se paga aparte. La propuesta
inicial usa la dirección gratuita `USUARIO.github.io`.

En un repositorio público son visibles tanto los datos como el historial.
Sube exclusivamente contenidos destinados a ser públicos. No copies
el CVN original: este proyecto no incluye ese PDF ni sus datos personales
ajenos a la finalidad de la web.

## Primera publicación

Esta configuración inicial se hace una sola vez. No hace falta que aprendas
Hugo ni que lo instales para utilizar la web después.

1. Crea una cuenta personal de GitHub, o utiliza la que ya tengas. El nombre
   de usuario formará parte de la dirección inicial.
2. Crea un repositorio **público** llamado exactamente
   `TU_USUARIO.github.io`. Selecciona `main` como rama principal. No subas el
   ZIP tal cual: GitHub debe ver el contenido descomprimido del proyecto.
3. Para la primera carga, una opción sencilla es GitHub Desktop: clona ese
   repositorio en tu ordenador, copia dentro **todos los archivos de esta
   carpeta**, crea un commit y pulsa Push. El archivo `hugo.toml` tiene que
   quedar en la raíz del repositorio, no dentro de `project/`.
   Comprueba que se hayan copiado también `.pages.yml`, `.gitignore` y la
   carpeta `.github/`; algunos exploradores ocultan nombres que empiezan
   por punto. No subas las carpetas `preview/` o `review/` al repositorio.
4. En GitHub, abre **Settings > Pages > Build and deployment > Source** y
   elige **GitHub Actions**. El workflow ya está incluido.
5. En **Actions**, abre *Build and publish academic website* y ejecútalo
   con **Run workflow**. Si la primera ejecución se lanzó antes de
   activar Pages y falló, vuelve a ejecutarla. Comprueba que `build` y
   `deploy` terminan correctamente; no basta con que los archivos estén
   en GitHub. La ejecución proporciona el enlace definitivo del sitio.
6. Revisa la web publicada en ordenador y móvil antes de difundirla.
   Especialmente: fotografía, enlaces de perfiles y datos bibliográficos
   indicados en `EDITORIAL.md`.

El workflow fija Hugo 0.167.0 y las versiones de Actions indicadas en la
receta oficial de Hugo consultada. Se instala únicamente el binario Hugo:
este proyecto no necesita dependencias Node, Sass, temas o submódulos.
El parámetro `baseURL` se obtiene de la configuración de Pages al
construir. La URL de ejemplo en `hugo.toml` no se utiliza como URL pública
en ese flujo. Para un despliegue manual, configura tu URL real.

## Activar el editor

1. Abre https://app.pagescms.org y entra con tu cuenta de GitHub.
2. Autoriza la aplicación de Pages CMS **solo para el repositorio de esta
   web**, no para todos tus repositorios.
3. Selecciona el repositorio y la rama `main`. El archivo `.pages.yml` ya
   define los formularios: Artículos, Eventos, Portada y enlaces, Docencia
   y Curriculum vitae.
4. Edita y guarda un contenido. Comprueba su cambio en el repositorio, la
   ejecución correcta en Actions y, después, el resultado en la web.

El editor no es un constructor de diseño por arrastrar elementos: cambia
los datos. Para tamaños, colores o estructura se edita el CSS o las
plantillas. Esa separación impide que un nuevo artículo descoloque la
maquetación. El contenido se conserva como archivos, no en una base de
datos exclusiva del servicio. Pages CMS no es Notion y no se ha configurado
una sincronización con Notion.

## Uso cotidiano

### Añadir un artículo

En Artículos, crea una entrada con título, autores en el orden de la
publicación, año, tipo y sus identificadores. La clave BibTeX es un
identificador estable como `berbel2026subgroup`. Pon los DOI y arXiv sin el
prefijo de la URL. El selector `Selected` solo controla ese filtro en
Research; no añade nada a la portada. No se muestran contadores de
publicaciones.

### Un preprint ya ha sido publicado

**Edita el mismo registro**, sin duplicarlo. Cambia el tipo a Journal article,
añade revista, volumen, número, páginas y DOI; conserva el campo
arXiv. Se actualizarán el filtro, la ficha y la cita generada. Revisa el
año: el de la revista puede diferir del depósito del preprint.

### Citas BibTeX

El botón BibTeX abre una ventana con copiar y descargar `.bib`. La cita
se genera desde el registro, incluyendo DOI y arXiv cuando existan. Se
escapan los acentos y se usan las entradas `article`, `misc` o `inproceedings`.
El campo opcional `BibTeX del editor` permite sustituir esta generación
por una cita canónica. **Si usas una sustitución, deberás actualizarla
también cuando cambie el artículo**. No se consulta automáticamente
Crossref ni se prometen metadatos bibliográficos verificados por el editor.

### Eventos

Cada evento tiene título de la contribución, nombre, lugar y fecha.
La fecha ISO sirve para ordenar; la fecha visible permite indicar un intervalo.
Diapositivas y web del evento son opcionales: no se muestra un enlace vacío.
El editor admite subir PDFs a `static/uploads`. Solo sube material que desees
publicar; no se reutilizan los archivos departamentales de Moodle.

### Docencia, CV y fotografía

La docencia de Comillas tiene el primer nivel visual; las asignaturas
anteriores aparecen como una lista secundaria. CV se edita por entradas;
los idiomas son una línea discreta al final. `Print CV` usa la impresión
del navegador con una hoja de estilo específica, desde la que se puede
guardar en PDF. No es un enlace al CVN original.

La fotografía se sustituye en Portada y enlaces. La actual procede del
CV aportado y tiene poca resolución (184 x 227); convendría sustituirla
por el original para pantallas de alta densidad. No ha sido recreada con IA.

## Archivos importantes

- `data/publications/*.json`: un registro por artículo.
- `data/events/*.json`: un registro por evento.
- `data/profile.json`, `teaching.json`, `cv.json`: contenido de las otras páginas.
- `.pages.yml`: formularios del editor y destinos de las imágenes/PDFs.
- `layouts/_partials/views/`: plantillas específicas de las páginas.
- `static/styles.css`: diseño adaptable, accesibilidad y estilos de impresión.
- `static/site.js`: menú, filtros y BibTeX.
- `.github/workflows/pages.yml`: validación, construcción y despliegue.

## Pruebas y mantenimiento

`python3 scripts/check_data.py` comprueba los campos antes de construir.
En CI se ejecuta además `python3 scripts/check_output.py public` tras Hugo.
Un error de datos impide publicar la nueva versión: revisa el mensaje en
Actions, corrige el registro y guarda otra vez. La comprobación detecta
formatos incorrectos, no la exactitud académica de una cita.

Para desarrollo local, con Hugo instalado: `hugo server`. Para generar los
archivos: `hugo build --baseURL https://TU_USUARIO.github.io/`. No cometas el
directorio `public/`: lo regenera Hugo. La web pública recibe HTML ya
construido y no ejecuta un servidor Hugo.

No se han añadido analítica, formularios de contacto ni cookies propias.
El diseño solicita Inter a Google Fonts con fuentes de sistema como
alternativa; no se incluyen archivos tipográficos en el paquete. Para
eliminar esa conexión externa, retira los enlaces a Google Fonts del
encabezado de `layouts/_partials/document.html`: el sitio seguirá
funcionando con la alternativa del sistema. Esta nota no sustituye una
revisión de privacidad del alojamiento que se utilice.

## Documentación oficial consultada

- Hugo + GitHub Pages: https://gohugo.io/host-and-deploy/host-on-github-pages/
- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Pages CMS, inicio: https://pagescms.org/docs/quick-start/
- Configuración de Pages CMS: https://pagescms.org/docs/configuration/
- Colecciones y archivos: https://pagescms.org/docs/configuration/content/
- Almacenamiento de imágenes y documentos: https://pagescms.org/docs/configuration/media/
- Servicio alojado y coste anunciado: https://pagescms.org/
