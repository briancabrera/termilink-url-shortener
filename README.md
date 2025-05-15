# TermiLink - Acortador de URLs con Estilo Terminal

**TermiLink** es un acortador de URLs minimalista con estilo de terminal que te permite crear enlaces cortos que expiran automáticamente después de 24 horas. Perfecto para compartir enlaces temporales de forma rápida y segura.

## 🚀 Características

- ⚡️ **Rápido**: Acorta tus URLs en menos de 0.5 segundos gracias a Redis.
- 🔐 **Seguro**: Los enlaces expiran automáticamente después de 24 horas.
- 🖥 **Simple**: Interfaz minimalista inspirada en la terminal.
- 🌐 **Multilingüe**: Soporte para español e inglés.

## 🛠 Tecnologías

- [Next.js 14](https://nextjs.org/) – Framework de React
- [Redis (Upstash)](https://upstash.com/) – Base de datos para almacenar URLs
- [Tailwind CSS](https://tailwindcss.com/) – Framework CSS
- [TypeScript](https://www.typescriptlang.org/) – Lenguaje tipado para JavaScript

## ✅ Requisitos

- Node.js 18.0.0 o superior
- Cuenta en [Upstash](https://upstash.com/) (o Redis local para desarrollo)

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
KV_URL=tu-url-de-redis
KV_REST_API_URL=tu-url-de-api-rest-de-redis
KV_REST_API_TOKEN=tu-token-de-api-de-redis
````

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/termilink.git
cd termilink
```

2. Instala las dependencias:

```bash
npm install
# o
yarn install
# o
pnpm install
```

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🚀 Despliegue

La forma más sencilla de desplegar TermiLink es usando [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftu-usuario%2Ftermilink)

Asegúrate de configurar las variables de entorno en la plataforma de despliegue.

## 🗂 Estructura del Proyecto

```
/
├── app/                    # Rutas y páginas de Next.js
│   ├── [lang]/             # Páginas con soporte para idiomas
│   ├── api/                # API endpoints
│   └── go/                 # Redirección de URLs cortas
├── components/             # Componentes React
├── dictionaries/           # Archivos de traducción
├── lib/                    # Utilidades y servicios
│   ├── redis.ts            # Cliente de Redis
│   └── utils.ts            # Funciones de utilidad
└── public/                 # Archivos estáticos
```

## 👤 Autor

[Brian Cabrera – Portfolio](https://briancabrera.com)

---

Desarrollado con ❤️ y ☕
