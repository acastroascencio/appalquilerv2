# Auditoria UX/UI y propuesta aplicable

Fecha: 2026-06-04  
Producto: AlquilerApp web y movil

## Resumen ejecutivo

AlquilerApp ya tiene flujos funcionales para departamentos, inquilinos, consumos, cobros, documentos y configuracion. La mejora principal necesaria era convertir esa base en una experiencia coherente, legible y segura para usuarios adultos, especialmente en pantallas pequenas.

La intervencion aplicada corrigio el problema mas critico de la web: el sidebar fijo generaba desborde horizontal en celular. Tambien se incorporo una base visual comun, cards moviles para cobros e inquilinos, botones mas grandes, estados de foco visibles, feedback inline en formularios principales y dialogos accesibles para acciones destructivas. La app movil recibio una segunda pasada sobre tokens, navegacion inferior, alertas, formularios apilables y confirmaciones.

## Auditoria UX/UI

| Area | Problema detectado | Impacto en usuario | Prioridad | Recomendacion |
| --- | --- | --- | --- | --- |
| Layout web movil | El sidebar fijo empujaba el contenido y generaba overflow horizontal. | El usuario en celular ve contenido cortado y debe desplazarse lateralmente. | Alta | Usar sidebar solo en desktop y navegacion inferior en movil. Aplicado. |
| Tablas | Cobros e inquilinos dependian de tabla con scroll horizontal. | Dificulta lectura y acciones en celular. | Alta | Mantener tabla en desktop y usar cards moviles con acciones grandes. Aplicado en web. |
| Formularios | Varias validaciones usaban `alert()` nativo. | Feedback abrupto y desconectado del campo o flujo. | Alta | Mostrar errores y exitos dentro de la pantalla/modal. Aplicado en formularios principales web y movil. |
| Botones | Algunos botones eran pequenos o solo icono. | Acciones ambiguas y area tactil limitada. | Alta | Botones con texto, icono y altura minima de 48 a 60 px. Aplicado parcialmente. |
| Iconografia | Predomina Lucide, pero habia iconos auxiliares manuales y estilos mixtos. | Menos consistencia visual. | Media | Mantener Lucide como familia unica. Iconos manuales de acciones retirados; queda solo SVG de grafica/progreso y assets de Vite no usados como controles. |
| Estado vacio | Algunos estados vacios eran mensajes simples con simbolos. | Puede sentirse poco profesional o poco claro. | Media | Usar empty states con texto accionable y CTA. Aplicado parcialmente. |
| Confirmaciones | Eliminaciones y marcar pago usaban `confirm()` nativo. | No comunica bien consecuencia ni permite UI consistente. | Media | Reemplazado por dialogos de confirmacion accesibles en web y movil. |
| Accesibilidad | Textos pequenos en tablas, labels y metadatos. | Lectura dificil para usuarios de 50+. | Alta | Base de 18 px, labels grandes, contraste alto y foco visible. Aplicado en bases web/movil. |
| Responsive movil | Algunas grillas moviles usaban 2 o 3 columnas en formularios. | Campos comprimidos y errores de lectura. | Alta | Apilar campos en movil y usar columnas solo desde `sm`. Aplicado en puntos criticos. |
| Performance visual | Bundle grande por PDF/html2canvas y dependencias. | Puede tardar mas en conexiones moviles. | Media | Code splitting para generacion PDF y modulos pesados. Pendiente. |

## Propuesta de rediseno

### Organizacion visual

- Web desktop: sidebar permanente, header superior con contexto de usuario, contenido en max-width y metricas en grid.
- Web movil: header compacto, navegacion inferior fija, cards en lugar de tablas, acciones grandes.
- App movil: mantener navegacion inferior, mejorar contraste, alertas completas, formularios de una columna.

### Componentes base

- Boton primario: azul, alto minimo 48 px web y 60 px movil, icono + texto.
- Boton secundario: fondo claro, borde visible, texto oscuro.
- Boton peligro: rojo fuerte, solo para eliminar, retirar o cerrar sesion.
- Inputs: altura amplia, label visible, foco azul claro, texto minimo 18 px en movil.
- Alertas: fondo completo con borde, icono y texto directo. Evitar bordes laterales gruesos.
- Cards moviles: titulo, resumen, datos clave y acciones agrupadas.
- Badges: exito, pendiente, advertencia, siempre con texto.

### Iconos recomendados

Usar Lucide React como familia unica. Mantener iconos acompanados por texto en acciones ambiguas:

- Guardar: `Save`
- Editar: `Edit`
- Eliminar: `Trash2`
- Cobrar WhatsApp: `MessageSquare`
- Pago confirmado: `CheckCircle`
- Error: `AlertCircle`
- Departamentos: `Building2`
- Inquilinos: `Users`
- Consumo: `Zap` o `Calculator`

## Mejoras por flujo

### Inicio / dashboard

- Problema: metricas y cobros pendientes no se adaptaban bien al movil.
- Mejora aplicada: cards de metricas mas legibles y cobros en cards moviles.
- Desktop: metricas en tres columnas, tabla compacta para cobros.
- Movil: metricas apiladas y cada cobro como card con botones grandes.
- Feedback: estados vacios y badges de pendiente.

### Departamentos

- Problema: modal con columnas fijas y validacion por alerta.
- Mejora aplicada: formulario responsive, error inline, controles tactiles y bloqueo de eliminacion ocupado como aviso en pantalla.
- Desktop: grid de departamentos.
- Movil: cards apiladas.
- Validaciones: identificador y costo base requeridos.

### Inquilinos

- Problema: tabla dificil en movil y formulario comprimido.
- Mejora aplicada: cards moviles, acciones tactiles, feedback inline en web, grillas apilables en movil y confirmacion accesible para retirar.
- Desktop: tabla con acciones alineadas.
- Movil: card por inquilino con telefono, garantia, vehiculo y acciones.
- Validaciones: nombre, telefono/celular y departamento requeridos.

### Consumo y cobros

- Problema: pantalla critica con muchos datos, algunos textos pequenos y alertas laterales.
- Mejora aplicada: alertas unificadas, base de controles grandes, mensajes inline al guardar y confirmacion accesible para eliminar periodos.
- Desktop/movil deseado: calculadora con pasos claros, resumen visible antes de guardar y WhatsApp solo tras exito.
- Validaciones: lectura actual no puede ser menor a anterior; inquilino requerido.

### Configuracion / Mi cuenta

- Problema: guardado dependia de alertas o mensajes visualmente aislados.
- Mejora aplicada: feedback inline web y alertas moviles completas.
- Validaciones: titular requerido.
- Feedback: exito dentro de la pantalla y estado de guardando.

## Reglas responsive

- Desktop `lg+`: sidebar lateral, tablas completas, grids de 2 a 3 columnas.
- Tablet `sm-md`: cards en 2 columnas cuando el contenido lo permite; formularios maximo 2 columnas.
- Movil `<640px`: una columna, navegacion inferior, botones full width, tablas convertidas a cards.
- No usar scroll horizontal salvo en tablas tecnicas inevitables.
- Campos relacionados pueden ir en grid solo desde `sm`.
- Botones destructivos deben quedar separados visualmente de acciones primarias.

## Checklist final

- [x] Web principal sin overflow horizontal en celular.
- [x] Navegacion movil visible y tactil.
- [x] Botones principales grandes y con icono + texto.
- [x] Cards moviles para cobros pendientes.
- [x] Cards moviles para inquilinos web.
- [x] Base tipografica mas legible.
- [x] Inputs con mayor altura y foco visible.
- [x] Formularios principales con feedback inline.
- [x] App movil con base visual unificada y alertas completas.
- [x] Reemplazar `window.confirm()` por dialogos accesibles en la web principal.
- [x] Reemplazar `window.confirm()` por dialogos accesibles en la app movil.
- [x] Retirar iconos SVG manuales de acciones.
- [x] Confirmar que no quedan `alert()` nativos en las superficies web/movil revisadas.
- [x] Confirmar que los formularios principales muestran feedback visual.
- [x] Documentar reglas desktop, tablet y movil para futuras pantallas.

## Siguientes mejoras tecnicas recomendadas

- Hacer code splitting de PDF/html2canvas para reducir el chunk principal.
- Resolver deuda de lint previa en archivos generados/imports/hooks.
- Profundizar QA visual de todos los modales y pantallas de consumo con pruebas automatizadas por viewport.

## Evidencia local

- Build web: `npm run build` pasa.
- Build movil: `npm run build` dentro de `movil` pasa.
- Busqueda de controles nativos: `rg "\balert\(" src movil\src`, `rg "window\.confirm|\bconfirm\(" src movil\src` y `rg "function Plus|function Building" src movil\src` no devuelven resultados.
- Browser web movil 390x844: sidebar oculto, navegacion inferior visible, sin overflow horizontal.
- Browser web desktop 1280px: sidebar visible, navegacion movil oculta, contenido dentro del viewport.
- Browser app movil 390x844: login y home demo sin overflow horizontal, navegacion inferior visible.
