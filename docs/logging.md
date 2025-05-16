# Sistema de Logging en TermiLink

Este documento explica cómo funciona el sistema de logging en TermiLink y cómo configurarlo.

## Características

- **Niveles de log**: Debug, Info, Warn, Error
- **Supresión de advertencias**: Filtrado de mensajes repetitivos o no importantes
- **Configuración por entorno**: Diferentes configuraciones para desarrollo y producción
- **Prefijos personalizables**: Facilita la identificación de los mensajes
- **Compatible con servidor y cliente**: Funciona tanto en el servidor como en el cliente

## Uso básico

\`\`\`typescript
import { logger } from "@/lib/logger"

// Diferentes niveles de log
logger.debug("Mensaje de depuración detallado")
logger.info("Información general")
logger.warn("Advertencia que no bloquea la ejecución")
logger.error("Error importante", errorObject)
\`\`\`

## Configuración

El sistema de logging se puede configurar al inicializarlo:

\`\`\`typescript
import { initializeLogger } from "@/lib/logger"

initializeLogger({
  minLevel: "info", // Solo mostrar logs de nivel info o superior
  forceLogsInProduction: false, // No mostrar logs en producción excepto errores
  prefixes: {
    debug: "[DEBUG]",
    info: "[INFO]",
    warn: "[WARN]",
    error: "[ERROR]",
  },
  suppressPatterns: [
    // Patrones de texto a suprimir (strings o RegExp)
    /Warning: ReactDOM.render is no longer supported/,
    "Este módulo solo debe importarse desde el servidor",
  ],
})
\`\`\`

## Niveles de Log

1. **debug**: Información detallada para depuración
2. **info**: Información general sobre el flujo de la aplicación
3. **warn**: Advertencias que no bloquean la ejecución
4. **error**: Errores importantes que pueden afectar la funcionalidad

## Supresión de Advertencias

El sistema puede suprimir advertencias específicas basadas en patrones:

\`\`\`typescript
// Suprimir todas las advertencias que contengan este texto
suppressWarnings([
  "Este módulo solo debe importarse desde el servidor",
  /Warning: ReactDOM/,
])
\`\`\`

## Variables de Entorno

- `DEBUG=true`: Fuerza la visualización de logs incluso en producción
- `NODE_ENV=production`: Suprime todos los logs excepto errores por defecto

## Mejores Prácticas

1. **Usa el nivel adecuado**: No uses `error` para información no crítica
2. **Incluye contexto**: Proporciona suficiente información para entender el mensaje
3. **Evita información sensible**: No registres contraseñas, tokens, etc.
4. **Usa objetos para datos estructurados**: `logger.info("Usuario", { id, name })`
5. **Suprime con cuidado**: No suprimas advertencias importantes

## Sobrescribir console.log

Si deseas reemplazar completamente los métodos de console:

\`\`\`typescript
import { logger } from "@/lib/logger"

// Sobrescribir los métodos de console
logger.overrideConsole()

// Para restaurar los métodos originales
logger.restoreConsole()
\`\`\`

## Configuración para Producción

En producción, el sistema está configurado para:

1. Mostrar solo errores por defecto
2. Suprimir advertencias comunes
3. Usar prefijos más concisos

Puedes forzar la visualización de logs en producción con la variable de entorno `DEBUG=true`.
