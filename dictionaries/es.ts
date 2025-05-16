export const dictionary = {
  metadata: {
    title: "TermiLink - Acortador de URLs",
    description: "Enlaces cortos que expiran en 24 horas.",
  },
  home: {
    title: "TermiLink",
    subtitle: "Acorta tus URLs por 24 horas",
    readme: {
      command: "cat README.md",
      description1: "TermiLink: Enlaces cortos que expiran en 24 horas.",
      description2: "Comparte enlaces temporales de forma rápida y segura.",
    },
    features: {
      speed: {
        command: "cat features/speed.txt",
        title: "Rápido",
        description: "Acorta tus URLs en menos de 0.5 segundos gracias a Redis.",
      },
      security: {
        command: "cat features/security.txt",
        title: "Seguro",
        description: "Los enlaces expiran automáticamente después de 24 horas.",
      },
      simple: {
        command: "cat features/simple.txt",
        title: "Simple",
        description: "Interfaz minimalista inspirada en la terminal para acortar tus URLs.",
      },
    },
    footer: {
      command: 'echo "© $(date +%Y) TermiLink"',
      debug: "./debug.sh",
    },
  },
  form: {
    command: "./acortar-url.sh",
    urlLabel: "URL:",
    urlPlaceholder: "https://ejemplo-de-url-muy-larga.com/ruta/muy/larga",
    submitButton: {
      loading: "Procesando...",
      default: "Acortar URL",
    },
    result: {
      command: "cat resultado.txt",
      existingUrl: "URL ya existente. Se extendió su tiempo de expiración a 24 horas.",
      expiresIn: "Expira en:",
      copyButton: "Copiar URL",
      copied: "¡Copiado!",
      copiedDescription: "URL copiada al portapapeles.",
    },
    error: {
      title: "ERROR:",
      invalidUrl: "La URL no parece válida. Asegúrate de que incluya un dominio real y comience con http:// o https://",
    },
    toast: {
      success: {
        title: "¡URL acortada con éxito!",
        description: "Tu URL corta está lista para usar.",
      },
      existing: {
        title: "URL existente encontrada",
        description: "URL ya existente. Se extendió su tiempo de expiración a 24 horas.",
      },
      error: {
        title: "Error",
        description: "Ocurrió un error al acortar la URL. Por favor, inténtalo de nuevo.",
      },
      invalidUrl: {
        title: "URL inválida",
        description:
          "La URL no parece válida. Asegúrate de que incluya un dominio real y comience con http:// o https://",
      },
      copy: {
        title: "¡Copiado!",
        description: "URL copiada al portapapeles.",
      },
    },
  },
  errors: {
    notFound: {
      title: "Error 404: Página no encontrada",
      description: "La ruta que estás buscando no existe en este servidor.",
      command: 'find / -name "requested-page" 2>/dev/null',
      result: "No results found.</dev/null",
      traceroute: "traceroute",
      tracerouteResult1: "traceroute to homepage (127.0.0.1), 30 hops max, 60 byte packets",
      tracerouteResult2: "1 localhost (127.0.0.1) 0.123 ms 0.456 ms 0.789 ms",
      homeCommand: "cd /home",
      homeButton: "Volver al inicio",
    },
    urlNotFound: {
      title: "Error 404: URL no encontrada",
      description: "La URL acortada que estás buscando no existe o ha expirado después de 24 horas.",
      command: "cat error.log",
      homeCommand: "cd /home",
      homeButton: "Volver al inicio",
    },
    general: {
      title: "Error inesperado",
      description: "Lo sentimos, ha ocurrido un error inesperado en la aplicación.",
      command: "cat /var/log/system_error.log",
      retryCommand: "./restart.sh",
      retryButton: "Intentar de nuevo",
      homeCommand: "cd /home",
      homeButton: "Volver al inicio",
    },
    redirect: {
      title: "Error en la redirección",
      description:
        "Lo sentimos, no pudimos redirigirte a la URL solicitada. El sistema ha encontrado un error inesperado.",
      command: "cat system_error.log",
      retryCommand: "./retry.sh",
      retryButton: "Intentar de nuevo",
      homeCommand: "cd /home",
      homeButton: "Volver al inicio",
    },
  },
  loading: {
    command: "loading",
    text: "Cargando recursos...",
  },
  debug: {
    title: "Diagnóstico del Sistema",
    command: "./system_diagnostics.sh",
    redisTest: {
      command: "test_redis_connection",
      button: "Probar conexión a Redis",
      buttonLoading: "Ejecutando...",
      result: "Resultado:",
      status: "Estado:",
      message: "Mensaje:",
      success: "Conexión exitosa",
      error: "Error de conexión",
      noMessage: "No hay mensaje",
    },
    homeCommand: "cd /home",
    homeButton: "Volver al inicio",
    admin: {
      title: "Panel de Administración",
      metrics: {
        title: "# === MÉTRICAS ===",
        totalUrls: "Total URLs",
        totalClicks: "Clicks Totales",
        averageClicks: "Clicks Promedio",
        lastUrl: "Última URL",
        noUrls: "No hay URLs",
        loading: "Cargando métricas...",
      },
      management: {
        title: "# === ADMINISTRACIÓN ===",
        search: {
          command: "find",
          placeholder: "Buscar por slug...",
          button: "Buscar",
          buttonLoading: "Buscando...",
          showAll: "Mostrar todos",
          notFound: "No se encontraron URLs",
        },
        list: {
          command: "ls -la",
          loading: "Cargando URLs...",
          columns: {
            slug: "Slug",
            originalUrl: "URL Original",
            clicks: "Clicks",
            actions: "Acciones",
          },
        },
        actions: {
          copy: "Copiar URL",
          delete: "Eliminar URL",
          confirmDelete: '¿Estás seguro de que deseas eliminar la URL con slug "{slug}"?',
        },
      },
      diagnostics: {
        title: "# === DIAGNÓSTICO ===",
      },
      auth: {
        login: {
          title: "# === ACCESO ADMIN ===",
          command: "./login.sh",
          emailLabel: "EMAIL:",
          passwordLabel: "CONTRASEÑA:",
          button: "Iniciar sesión",
          buttonLoading: "Procesando...",
          noAccount: "¿No tienes cuenta? Regístrate",
        },
        signup: {
          title: "# === REGISTRO ADMIN ===",
          command: "./registro.sh",
          emailLabel: "EMAIL:",
          passwordLabel: "CONTRASEÑA:",
          button: "Registrarse",
          buttonLoading: "Procesando...",
          haveAccount: "¿Ya tienes cuenta? Inicia sesión",
        },
        logout: "Cerrar sesión",
        verifyingSession: "Verificando sesión...",
        verifyingAuth: "Verificando autenticación...",
        accessDenied: "Acceso denegado",
        noPermissions: "No tienes permisos de administrador para acceder a esta sección.",
      },
      toast: {
        dataUpdated: {
          title: "Datos actualizados",
          description: "Los datos del sistema se han actualizado correctamente.",
        },
        searchError: {
          title: "Error de búsqueda",
          description: "Ingresa un slug para buscar.",
        },
        urlFound: {
          title: "URL encontrada",
          description: 'Se encontró la URL con slug "{slug}"',
        },
        urlNotFound: {
          title: "URL no encontrada",
          description: 'No se encontró ninguna URL con slug "{slug}"',
        },
        searchError: {
          title: "Error",
          description: "Ocurrió un error al buscar la URL.",
        },
        urlDeleted: {
          title: "URL eliminada",
          description: 'La URL con slug "{slug}" ha sido eliminada correctamente.',
        },
        deleteError: {
          title: "Error",
          description: "Ocurrió un error al eliminar la URL.",
        },
        urlCopied: {
          title: "URL copiada",
          description: 'La URL "{url}" ha sido copiada al portapapeles.',
        },
        copyError: {
          title: "Error",
          description: "No se pudo copiar la URL al portapapeles.",
        },
        loginSuccess: {
          title: "Acceso exitoso",
          description: "Bienvenido al panel de administración.",
        },
        signupSuccess: {
          title: "Cuenta creada",
          description: "Revisa tu email para confirmar tu cuenta.",
        },
        authError: {
          title: "Error de autenticación",
          description: "Ocurrió un error durante la autenticación.",
        },
      },
      buttons: {
        updateData: "Actualizar datos",
        updating: "Actualizando...",
        backToHome: "Volver al inicio",
      },
    },
  },
  languageSwitcher: {
    label: "Idioma",
  },
}
