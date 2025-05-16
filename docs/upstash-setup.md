# Configuración de Upstash Redis para TermiLink

Este documento explica cómo configurar correctamente Upstash Redis para el proyecto TermiLink.

## Variables de Entorno Requeridas

TermiLink utiliza Upstash Redis para almacenar las URLs acortadas. Para que funcione correctamente, necesitas configurar las siguientes variables de entorno:

### Variables Principales (Recomendadas)

\`\`\`
KV_REST_API_URL=https://tu-instancia.upstash.io
KV_REST_API_TOKEN=tu-token-de-api
\`\`\`

Estas son las variables recomendadas para usar con Upstash Redis en Vercel.

### Variables Alternativas

\`\`\`
KV_URL=https://tu-instancia.upstash.io
\`\`\`

## Cómo Obtener las Credenciales de Upstash

1. Crea una cuenta en [Upstash](https://upstash.com/) si aún no tienes una.
2. Crea una nueva base de datos Redis.
3. En la página de detalles de tu base de datos, ve a la pestaña "REST API".
4. Copia los valores de `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.
5. Configura estas variables en tu entorno de desarrollo o en tu plataforma de despliegue (como Vercel).

## Verificación de la Conexión

Puedes verificar si la conexión a Upstash Redis está funcionando correctamente visitando la ruta `/[lang]/debug` en tu aplicación y haciendo clic en "Probar conexión a Redis".

## Solución de Problemas

Si encuentras problemas con la conexión a Upstash Redis:

1. Verifica que las variables de entorno estén configuradas correctamente.
2. Asegúrate de que tu base de datos Redis en Upstash esté activa.
3. Comprueba si hay restricciones de IP en tu base de datos Upstash.
4. Revisa los logs de la aplicación para ver mensajes de error específicos.

## Modo de Desarrollo

En modo de desarrollo, si no se configuran las variables de entorno, TermiLink utilizará un cliente Redis simulado que almacena los datos en memoria. Esto es útil para desarrollo local, pero los datos se perderán al reiniciar la aplicación.

## Despliegue en Vercel

Para desplegar TermiLink en Vercel con Upstash Redis:

1. En tu proyecto de Vercel, ve a "Settings" > "Environment Variables".
2. Añade las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN` con los valores de tu base de datos Upstash.
3. Redespliega tu aplicación para que los cambios surtan efecto.

También puedes usar la integración de Vercel con Upstash, que configurará automáticamente estas variables:

1. En tu proyecto de Vercel, ve a "Integrations".
2. Busca "Upstash Redis" y haz clic en "Add Integration".
3. Sigue las instrucciones para conectar tu base de datos Upstash.
