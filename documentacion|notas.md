*Instalar:*
sudo apt install npm
*Instalar Express:*
npm install express
*Docker* (chequear instalacion)
docker --version
docker-compose --version
*Configurar Redis*
npm install redis
*Instalacion para  Endpoints
npm install axios (Instala axios para hacer requests a la API de Free Dictionary)
*Buildear con *
- docker-compose up --build 


Notas 
- Falta configura Redis como caché para la API. Decide la estrategia de cacheo (lazy o active population).
- yml parece que ya viene completo
- *Configurar Nginx* Nota: edite basico para ver como funciona nginx_reverse_proxy, buscar mejor y aseguránse de que todo el tráfico pase*
- Hay que revisar carpetas/ direcciones/ puertos / links (yml)
- localhost:5555, Nginx redirigirá el tráfico hacia tu aplicación Node.js en el puerto 3000.
- proxy_set_header: Estos comandos configuran los encabezados HTTP que Nginx enviará a tu aplicación backend cuando redirija las solicitudes. 



Notas del yml:
- ./nginx_reverse_proxy.conf:/etc/nginx/conf.d/default.conf:ro: 
ro significa que es de solo lectura.
- graphite viene con statsD
- ports de graphite
    - 8090:80: El puerto 8090 en la máquina host está mapeado al puerto 80 del contenedor para acceder al dashboard de Graphite.
    - 8125:8125/udp: StatsD escucha en este puerto para recibir datos en formato UDP.
    - 8126:8126: Puerto para StatsD en TCP.
- command: Comando que especifica cómo cAdvisor debe almacenar las métricas
    - storage_driver="statsd": Usa StatsD como backend de almacenamiento.
    - storage_driver_host="graphite:8125": Indica que el servicio de Graphite está escuchando en el puerto 8125.
    - storage_driver_db="cadvisor" -storage_driver_buffer_duration="1s" --docker_only=true' :detalles de la base de datos (cadvisor) y la duración del buffer.