# AdoptAI: metodologia del caso financiero (modelo 3)

## Alcance y limites

AdoptAI es una herramienta de apoyo a la decision, no una auditoria, presupuesto vinculante, prediccion estadistica ni garantia de rentabilidad. Relaciona los procesos elegidos explicitamente con diez soluciones de un catalogo mantenido editorialmente. El texto libre se conserva como contexto: no se envia a un modelo ni se interpreta automaticamente.

El calculo se ejecuta localmente en el navegador. No requiere claves de API y no envia automaticamente el formulario a Supabase ni a proveedores. Los enlaces externos solo se abren por iniciativa del usuario. El informe CSV contiene informacion empresarial: debe custodiarse como tal.

## Datos necesarios

- Empresa: sector, tamano, pais, objetivo, moneda, presupuesto y plazo.
- Economia laboral: salario bruto anual, cargas empresariales adicionales, dias laborables efectivos y jornada diaria. No son medias nacionales ni asesoramiento laboral.
- Por cada proceso: personas participantes, tareas mensuales, minutos activos por tarea (sin esperas), tasa de error, coste externo del error, porcentaje de coste laboral liberado realmente evitable, origen medido/estimado y notas de evidencia.
- Preparacion: datos, proceso, adopcion, infraestructura; sistemas existentes, sensibilidad y residencia europea exigida.
- Simulador: todos los costes iniciales y recurrentes, revision humana, cobertura automatizable, costes de uso, mejora de errores, reduccion de otros costes, plazo, adopcion gradual, contingencia y descuento.

No se utiliza facturacion anual como sustituto del ahorro: aumentar ingresos no equivale a generar margen incremental. Si se quiere valorar crecimiento comercial, debe prepararse un caso separado con margen, atribucion y costes de entrega, fuera del modelo actual.

## Formulas

1. Demanda anual en horas = tareas/mes * 12 * minutos/tarea / 60.
2. Capacidad = personas * dias laborables * horas/dia. Horas base = minimo(demanda, capacidad). Si se supera la capacidad, se muestra una alerta y se limita tambien el volumen sobre el que se estiman errores y consumo.
3. Coste horario cargado = salario * (1 + cargas/100) / (dias * horas/dia).
4. Horas liberadas = horas base * cobertura automatizada * (1 - revision). La revision es la fraccion del tiempo manual equivalente automatizado que sigue siendo necesaria.
5. Valor de capacidad = horas liberadas * coste horario. **No es caja**. Ahorro laboral efectivo = valor de capacidad * porcentaje de realizacion. El valor por defecto de realizacion es cero: solo se introduce un porcentaje positivo con una justificacion, como horas extra o contrataciones evitadas.
6. Errores externos evitados = tareas viables * tasa de error * coste externo por error * cobertura automatizada * reduccion de errores en tareas automatizadas. No incluir trabajo de correccion ya contado en las horas ni otras partidas duplicadas.
7. Otros ahorros = otros costes operativos anuales * reduccion explicita. Estos costes excluyen trabajo, errores y nuevas herramientas ya contabilizados.
8. Beneficio efectivo anual a plena adopcion = ahorro laboral efectivo + errores evitados + otros ahorros. No se suman porcentajes arbitrarios de productividad, rapidez y automatizacion sobre la misma base.

## Libro de caja mensual

- Mes 0: desembolso inicial de desarrollo, consultoria, infraestructura, software inicial, integracion y formacion, mas contingencia. Cada partida se introduce una sola vez.
- Meses 1 a 36: costes fijos recurrentes desde el primer mes, incluidos API fija, licencias, mantenimiento, supervision, soporte y retreino anual prorrateado. Es una convencion conservadora explicita; el modelo no simula contratos con fechas individuales de activacion.
- Beneficios y consumo variable: empiezan el mes posterior al plazo de entrega. Adopcion lineal desde 1/rampa hasta 100%. El consumo variable se aplica solo a tareas automatizadas viables; la API mensual debe representar cargos adicionales, no duplicar ese consumo.
- Ahorro operativo efectivo del ano 1 = beneficios efectivos de los meses 1-12 menos costes recurrentes de esos meses. Excluye la inversion inicial.
- Valor neto del ano 1 = ahorro operativo del ano 1 menos inversion inicial.
- ROI 12 meses = valor neto del ano 1 / **todos** los costes de los primeros 12 meses, incluida inversion, por 100. Si los costes son cero, se indica que no esta definido.
- Valor 24 meses: saldo acumulado efectivo hasta el mes 24.
- VAN 36 meses: desembolso inicial mas suma de flujos mensuales divididos por (1 + descuento anual)^(mes/12).
- Recuperacion: primer cruce acumulado no negativo que se mantiene hasta el fin del horizonte. Se interpola dentro del mes; la fecha indica el mes calendario del cruce. Se muestra explicitamente si no se recupera en 36 meses.
- Financiacion maxima: mayor deficit acumulado, no solo el coste de implantacion.
- No se incluyen impuestos, IVA, inflacion, financiacion, amortizacion contable, valor residual ni crecimiento de demanda. Se modelan flujos, no beneficio contable.

El coste antes/despues compara el coste operativo imputado al proceso en el primer ano, sin inversion inicial. No representa el coste total de toda la plantilla. El valor de capacidad y el ahorro a plena adopcion son magnitudes anualizadas, distintas del primer ano con rampa.

## Escenarios y decision

Los factores son hipotesis editables, no percentiles ni intervalos de confianza:

- Conservador: cobertura y reducciones de otros costes al 75%, costes al 125%, un mes adicional de retraso.
- Base: hipotesis introducidas.
- Optimista: cobertura y reducciones al 115%, costes al 100%. La cobertura no puede superar el 100%. Una mayor automatizacion puede elevar costes variables: el nombre del escenario no garantiza mejores flujos cuando no existe ahorro realizable.

El indice de preparacion es la media de calidad de datos, madurez del proceso, adopcion, infraestructura y facilidad tecnica (10 - dificultad)*10. No es una probabilidad de exito.

VAN no positivo: no justificado por caja. VAN positivo pero base no medida, preparacion menor que 60, incoherencia de capacidad, presupuesto insuficiente o plazo incumplido: validar antes de invertir. Superar estos filtros sugiere evaluar un piloto, nunca autoriza automaticamente un despliegue.

Prioridad: finanzas 40%, viabilidad 20%, preparacion 15%, objetivo 15%, presupuesto 5%, plazo 5%. Finanzas normaliza VAN/coste total a 0-100; el valor de la matriz mezcla finanzas (60%) y objetivo (40%). La dificultad combina complejidad, infraestructura, datos y riesgo del tipo de solucion. Es una heuristica visible y reproducible, no precision estadistica. Los puntos se dibujan con sus coordenadas reales, sin desplazamientos aleatorios; el listado permite seleccionar puntos coincidentes.

No sumar ahorros de oportunidades que compartan plantilla o tareas. La herramienta compara proyectos individuales, no construye una cartera libre de doble contabilizacion.

## Costes iniciales y proveedores

Las estimaciones de piloto parten de jornadas orientativas por solucion * 800 unidades monetarias/jornada. Se reparten entre desarrollo (45%), consultoria (15%), integracion (30%) y formacion (10%). No son precios de mercado contrastados ni conversiones automaticas. Licencias 150/mes, mantenimiento 100/mes, supervision 50/mes y consumo 0,05/tarea son hipotesis editables. Sustituir todo por propuestas escritas y un piloto medido.

Cambiar moneda en una simulacion requiere introducir un tipo de cambio. Se convierten todos los campos monetarios, incluido presupuesto; no se consulta un servicio de divisas ni se presenta un tipo como vigente. La moneda de una simulacion no altera otras simulaciones.

El catalogo muestra opciones ilustrativas, favorece visualmente herramientas ya presentes en la empresa y enlaza fuentes oficiales revisadas el 11-09-2026. No representa una clasificacion exhaustiva de proveedores ni una certificacion de residencia UE. Validar caracteristicas, conectores, region, permisos, conservacion, tratamiento de datos y condiciones de contrato antes de contratar.

Fuentes de producto y contratacion:

- [Microsoft 365 Copilot](https://www.microsoft.com/en-us/microsoft-365-copilot/pricing)
- [Power Automate](https://www.microsoft.com/en-us/power-platform/products/power-automate/pricing)
- [Intercom / Fin](https://www.intercom.com/pricing) y [socios de soluciones](https://www.intercom.com/solution-partner-program)
- [UiPath](https://www.uipath.com/pricing) y [socios de servicios](https://www.uipath.com/partners/service-partners)
- [HubSpot Sales Hub](https://www.hubspot.com/products/sales/sales-automation) y [directorio](https://ecosystem.hubspot.com/marketplace/solutions)
- [Atlassian Rovo](https://support.atlassian.com/rovo/docs/what-is-rovo/) y [socios](https://www.atlassian.com/partners)
- [Directorio de Microsoft](https://marketplace.microsoft.com/marketplace/partner-dir)

Referencia metodologica general: [HM Treasury, The Green Book 2026](https://www.gov.uk/government/publications/the-green-book-appraisal-and-evaluation-in-central-government/the-green-book-2026), para distinguir costes/beneficios, explicitar supuestos y evaluar sensibilidad. No se adopta su tasa social de descuento: el 10% inicial es una hipotesis empresarial editable. AdoptAI no esta certificado ni avalado por estas entidades.

## Validacion y persistencia

`pnpm test` verifica formulas con un caso manual, limites de capacidad, ausencia de doble contabilizacion, perdidas, escenarios, divisas, recuperacion, presupuesto/plazo, migracion, correspondencia entre pantallas y cobertura de seis idiomas.

`tests/browser-qa.cjs` recorre landing, formulario, analisis, ROI, persistencia, recomendacion y matriz mediante Playwright sobre el export estatico en seis idiomas y tres tamanos de pantalla. Ejecutar tras `pnpm build`, con Playwright instalado o `PLAYWRIGHT_MODULE` apuntando al modulo disponible y Edge instalado (o `BROWSER_CHANNEL`).

Los ajustes se guardan por oportunidad. La migracion conserva una copia anterior en `adopt-ai-assessment-pre-v3` y descarta resultados financieros antiguos, nunca los presenta como actuales. Las antiguas estimaciones basadas solo en tamano de empresa deben sustituirse por una nueva medicion de procesos. Reiniciar elimina tambien la copia local.

Una futura conversacion generativa con preguntas abiertas necesita un backend seguro, fuentes recuperadas, control de acceso y validacion de respuestas. No se simula esa capacidad con texto predefinido ni se incluyen claves privadas en GitHub Pages. La guia actual responde mediante preguntas tematicas y fuentes documentadas.
