# TP 1 de Arquitectura del Software (75.73/TB054) del 2do cuatrimestre de 2024

[Link overleaf informe](https://www.overleaf.com/project/66f9eb4b56de8e55b06fbc91)

> **Entrega :03/10** 

Este trabajo práctico tiene como objetivo principal comparar diversas tecnologías y evaluar cómo diferentes aspectos impactan en los atributos de calidad de un sistema. Al explorar este tema, buscamos no solo identificar las mejores prácticas y herramientas, sino también entender el impacto de las decisiones tecnológicas en el rendimiento y la confiabilidad de los servicios.

A lo largo de este TP, nos enfocaremos en una serie de tecnologías ampliamente utilizadas en la industria, incluyendo Node.js con Express para la construcción de APIs, Docker y Docker Compose para la containerización y gestión de servicios, Nginx como servidor proxy y balanceador de carga, y Redis para el almacenamiento en caché. También utilizaremos Artillery como generador de carga para simular distintos escenarios de tráfico, y herramientas como cAdvisor, StatsD, Graphite y Grafana para la recolección y visualización de métricas en tiempo real.

## Consigna

Implementar un servicio HTTP en Node.js-Express que represente una API que consume otras APIs para dar información a sus usuarios, similar a lo que brindaría una API para una página de inicio personalizada. Someter sus endpoints a diversas intensidades/escenarios de carga en algunas configuraciones de deployment, tomar mediciones y analizar resultados.

A partir de este repositorio como punto inicial, van a tener que implementar el webserver y dockerizarlo (completar la carpeta `app/`), agregar los servicios con el webserver al `docker-compose.yml`, y configurar las locations y upstreams de nginx en `nginx_reverse_proxy.conf`.

> **El tráfico entre cliente y servidor debe pasar por el nginx, para que tenga la latencia del salto "extra"**

Para generar carga y ver las mediciones obtenidas, en la carpeta `perf/` tienen un dashboard de Grafana ya armado (`dashboard.json`) al que **deberán ajustar según las características de su equipo de pruebas (RAM, cores)** y un ejemplo de un escenario básico de Artillery (**deben** crear sus propios escenarios de manera apropiada para lo que estén probando). También hay un script y una configuración en el `package.json` para que puedan ejecutar los escenarios que hagan corriendo:

```npm run scenario <filename> <env>```

donde `<filename>` es el nombre del archivo con el escenario (sin la extensión `.yaml`) y `<env>` es el entorno en el cual correrá la prueba (vean la sección `environments` dentro del yaml del escenario).

### Servicios

#### Ping

*Endpoint*: `/ping`

Este servicio devolverá un valor constante, sin procesamiento. Lo utilizaremos como healthcheck y como baseline para comparar con los demás.

#### Dictionary

*Endpoint*: `/dictionary?word=<word>`

Devolveremos **fonética (phonetics) y significados (meanings)** de palabras en inglés, consultando a la [Free Dictionary API](https://dictionaryapi.dev/).

Tengan en cuenta que la API devuelve más campos que los que debemos devolver nosotros.

#### Spaceflight News

*Endpoint*: `/spaceflight_news`

Devolveremos **solo los títulos** de las 5 últimas noticias sobre actividad espacial, obtenidas desde la [Spaceflight News API](https://spaceflightnewsapi.net/).

Ver [documentación de la API](https://api.spaceflightnewsapi.net/v4/docs/)

#### Random quote

*Endpoint*: `/quote`

Devolveremos 1 cita famosa con su autor (ningún otro dato) al azar por cada invocación, tomada de [Quotable](https://github.com/lukePeavey/quotable). Debe evitarse entregar la misma cita cada vez (salvo que la repita la API remota).


### Tácticas

#### Caso base

El caso base existe solo para tomar como referencia y poder verificar si hay mejoras con las tácticas aplicadas.

#### Caché

Utilizarán Redis como caché (ver [redis](https://www.npmjs.com/package/redis))

La idea es que elijan la estrategia más apropiada para llenar, conservar y vaciar la información del caché según estos criterios (consulten la documentación tanto de las APIs como de aquello que informan para poder contestar las siguientes preguntas):

- Aplicación: Esta información, ¿es cacheable?
- Tamaño: Cuántos ítems almacenar en el caché.
- Llenado: Decidir entre
  - Active population: Incorporar la información al caché antes de que la solicite el cliente.
    - ¿Se puede traer información cada cierto tiempo para tener algo que darle al cliente?
  - Lazy population: Incorporar la información cuando la pide el primer cliente.
- Tiempo de vida: Cuánto tiempo debe permanecer el dato en el caché antes de ser eliminado. Depende de si la información que almacenamos expira (deja de tener validez por paso del tiempo) o puede estar permanentemente / hasta ser accedida por alguien.
- Vaciado: Si tomo un ítem del caché, ¿debo eliminarlo o puede/debe permanecer para otro pedido?

#### Replicación

Escalarán el servicio a 3 copias, convirtiendo a nginx en un load balancer.

#### Rate limiting

Deberán experimentar con una solución que limite el rate de consumo de la API. Pueden ver [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) o [cómo hacerlo con nginx](https://www.nginx.com/blog/rate-limiting-nginx/). No es necesario que prueben ambas, alcanza con una.

### Generación de carga para las pruebas y métricas 

1. **Escenarios lanzados (stacked)**
   - Total de escenarios lanzados
   - Escenarios individuales en ejecución

2. **Estado de las solicitudes (stacked)**
   - Solicitudes completadas (códigos 200)
   - Solicitudes pendientes
   - Errores en las solicitudes
   - Solicitudes limitadas (códigos 429)

3. **Tiempos de respuesta (client-side)**
   - Duración máxima de los tiempos de respuesta
   - Mediana de los tiempos de respuesta

IMPORTANTE:

1. **Demora de cada endpoint en responder**
   - Tiempo total de respuesta (API remota + procesamiento propio)

2. **Demora de cada API remota en responder**
   - Tiempo de respuesta de la API remota


Pueden usar [hot-shots](https://www.npmjs.com/package/hot-shots)
