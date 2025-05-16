export const dictionary = {
  metadata: {
    title: "TermiLink - URL Shortener",
    description: "Short links that expire in 24 hours.",
  },
  home: {
    title: "TermiLink",
    subtitle: "Shorten your URLs for 24 hours",
    readme: {
      command: "cat README.md",
      description1: "TermiLink: Short links that expire in 24 hours.",
      description2: "Share temporary links quickly and securely.",
    },
    features: {
      speed: {
        command: "cat features/speed.txt",
        title: "Fast",
        description: "Shorten your URLs in less than 0.5 seconds thanks to Redis.",
      },
      security: {
        command: "cat features/security.txt",
        title: "Secure",
        description: "Links automatically expire after 24 hours.",
      },
      simple: {
        command: "cat features/simple.txt",
        title: "Simple",
        description: "Minimalist terminal-inspired interface for shortening your URLs.",
      },
    },
    footer: {
      command: 'echo "© $(date +%Y) TermiLink"',
      debug: "./debug.sh",
    },
  },
  form: {
    command: "./shorten-url.sh",
    urlLabel: "URL:",
    urlPlaceholder: "https://example-of-a-very-long-url.com/very/long/path",
    submitButton: {
      loading: "Processing...",
      default: "Shorten URL",
    },
    result: {
      command: "cat result.txt",
      existingUrl: "Existing URL found. Its expiration time has been extended to 24 hours.",
      expiresIn: "Expires in:",
      copyButton: "Copy URL",
      copied: "Copied!",
      copiedDescription: "URL copied to clipboard.",
    },
    error: {
      title: "ERROR:",
      invalidUrl: "The URL doesn't seem valid. Make sure it includes a real domain and starts with http:// or https://",
    },
    toast: {
      success: {
        title: "URL shortened successfully!",
        description: "Your short URL is ready to use.",
      },
      existing: {
        title: "Existing URL found",
        description: "Existing URL found. Its expiration time has been extended to 24 hours.",
      },
      error: {
        title: "Error",
        description: "An error occurred while shortening the URL. Please try again.",
      },
      invalidUrl: {
        title: "Invalid URL",
        description:
          "The URL doesn't seem valid. Make sure it includes a real domain and starts with http:// or https://",
      },
      copy: {
        title: "Copied!",
        description: "URL copied to clipboard.",
      },
    },
  },
  errors: {
    notFound: {
      title: "Error 404: Page Not Found",
      description: "The path you are looking for does not exist on this server.",
      command: 'find / -name "requested-page" 2>/dev/null',
      result: "No results found.</dev/null",
      traceroute: "traceroute",
      tracerouteResult1: "traceroute to homepage (127.0.0.1), 30 hops max, 60 byte packets",
      tracerouteResult2: "1 localhost (127.0.0.1) 0.123 ms 0.456 ms 0.789 ms",
      homeCommand: "cd /home",
      homeButton: "Back to Home",
    },
    urlNotFound: {
      title: "Error 404: URL Not Found",
      description: "The shortened URL you are looking for does not exist or has expired after 24 hours.",
      command: "cat error.log",
      homeCommand: "cd /home",
      homeButton: "Back to Home",
    },
    general: {
      title: "Unexpected Error",
      description: "Sorry, an unexpected error has occurred in the application.",
      command: "cat /var/log/system_error.log",
      retryCommand: "./restart.sh",
      retryButton: "Try Again",
      homeCommand: "cd /home",
      homeButton: "Back to Home",
    },
    redirect: {
      title: "Redirection Error",
      description:
        "Sorry, we couldn't redirect you to the requested URL. The system has encountered an unexpected error.",
      command: "cat system_error.log",
      retryCommand: "./retry.sh",
      retryButton: "Try Again",
      homeCommand: "cd /home",
      homeButton: "Back to Home",
    },
  },
  loading: {
    command: "loading",
    text: "Loading resources...",
  },
  debug: {
    title: "System Diagnostics",
    command: "./system_diagnostics.sh",
    redisTest: {
      command: "test_redis_connection",
      button: "Test Redis Connection",
      buttonLoading: "Running...",
      result: "Result:",
      status: "Status:",
      message: "Message:",
      success: "Connection successful",
      error: "Connection error",
      noMessage: "No message",
    },
    homeCommand: "cd /home",
    homeButton: "Back to Home",
  },
  languageSwitcher: {
    label: "Language:",
    es: "Spanish",
    en: "English",
  },
}
