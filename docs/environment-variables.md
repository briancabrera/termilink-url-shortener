# Manejo de Variables de Entorno en Next.js

Este documento explica cómo manejar correctamente las variables de entorno en Next.js para el proyecto TermiLink.

## Tipos de Variables de Entorno en Next.js

Next.js tiene dos tipos de variables de entorno:

1. **Variables de entorno del servidor**: Solo accesibles en el servidor.
2. **Variables de entorno públicas**: Accesibles tanto en el servidor como en el cliente.

## Variables de Entorno del Servidor

Las variables de entorno normales (sin prefijo `NEXT_PUBLIC_`) solo están disponibles en el servidor. Esto incluye:

- Archivos de API Routes (`app/api/...`)
- Componentes del servidor (archivos sin la directiva `'use client'`)
- Server Actions
- Middleware
- `getStaticProps` y `getServerSideProps`

Ejemplos de variables de entorno del servidor en TermiLink:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `REDIS_URL`

## Variables de Entorno Públicas

Para hacer que una variable de entorno esté disponible en el cliente, debe tener el prefijo `NEXT_PUBLIC_`. Estas variables se incrustan en el JavaScript del cliente durante la compilación.

Ejemplo:
\`\`\`
NEXT_PUBLIC_SITE_NAME=TermiLink
\`\`\`

## Cómo Acceder a Variables de Entorno del Servidor desde el Cliente

Si necesitas acceder a datos que dependen de variables de entorno del servidor desde un componente cliente, debes:

1. Crear una API Route que acceda a las variables de entorno del servidor
2. Llamar a esa API Route desde tu componente cliente usando `fetch`

Ejemplo:

\`\`\`typescript
// app/api/config/route.ts (Servidor)
export async function GET() {
  return Response.json({
    appName: process.env.APP_NAME,
    // NO incluir tokens o secretos aquí
  })
}

// En un componente cliente
const [config, setConfig] = useState(null)

useEffect(() => {
  async function fetchConfig() {
    const res = await fetch('/api/config')
    const data = await res.json()
    setConfig(data)
  }
  fetchConfig()
}, [])
\`\`\`

## Mejores Prácticas

1. **Nunca exponer secretos**: No uses `NEXT_PUBLIC_` para tokens, claves API o cualquier información sensible.
2. **Usar .env.local**: Almacena variables de entorno locales en un archivo `.env.local` que no se suba al control de versiones.
3. **Validar variables de entorno**: Verifica que las variables de entorno requeridas estén presentes al iniciar la aplicación.
4. **Proporcionar valores por defecto**: Cuando sea posible, proporciona valores por defecto para las variables de entorno.

## Configuración en Vercel

Para configurar variables de entorno en Vercel:

1. Ve a la configuración de tu proyecto en Vercel
2. Navega a la sección "Environment Variables"
3. Añade tus variables de entorno
4. Puedes configurar diferentes valores para diferentes entornos (Production, Preview, Development)

## Solución de Problemas

Si ves errores como:

\`\`\`
REDIS_URL cannot be accessed on the client
KV_URL cannot be accessed on the client
KV_REST_API_URL cannot be accessed on the client
\`\`\`

Significa que estás intentando acceder a variables de entorno del servidor desde un componente cliente. Soluciones:

1. Mueve la lógica a un componente del servidor o API Route
2. Crea un endpoint de API que proporcione los datos necesarios
3. Si realmente necesitas la variable en el cliente, usa el prefijo `NEXT_PUBLIC_` (solo para información no sensible)
