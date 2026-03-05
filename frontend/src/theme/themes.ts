import { createTheme } from '@mui/material';

// Светлая тема - современная, яркая, молодежная
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea', // Фиолетово-синий
      light: '#8b9ff5',
      dark: '#4d5fd1',
    },
    secondary: {
      main: '#f093fb', // Розовый градиент
      light: '#f5b1fc',
      dark: '#e871f9',
    },
    background: {
      default: '#f8f9ff', // Очень светлый голубоватый
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#718096',
    },
    success: {
      main: '#48bb78',
    },
    error: {
      main: '#f56565',
    },
    warning: {
      main: '#ed8936',
    },
    info: {
      main: '#4299e1',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(102, 126, 234, 0.1)',
    '0 4px 12px rgba(102, 126, 234, 0.15)',
    '0 6px 16px rgba(102, 126, 234, 0.2)',
    '0 8px 24px rgba(102, 126, 234, 0.25)',
    '0 12px 32px rgba(102, 126, 234, 0.3)',
    '0 16px 48px rgba(102, 126, 234, 0.35)',
    '0 24px 64px rgba(102, 126, 234, 0.4)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: '15px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(102, 126, 234, 0.1)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});

// Темная тема - глубокая, градиентная, стильная
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b9ff5',
      light: '#a5b5f7',
      dark: '#667eea',
    },
    secondary: {
      main: '#f093fb',
      light: '#f5b1fc',
      dark: '#e871f9',
    },
    background: {
      default: '#0f0f23', // Глубокий темно-синий
      paper: '#1a1a2e', // Чуть светлее
    },
    text: {
      primary: '#edf2f7',
      secondary: '#a0aec0',
    },
    success: {
      main: '#68d391',
    },
    error: {
      main: '#fc8181',
    },
    warning: {
      main: '#f6ad55',
    },
    info: {
      main: '#63b3ed',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 2px 8px rgba(139, 159, 245, 0.15)',
    '0 4px 12px rgba(139, 159, 245, 0.2)',
    '0 6px 16px rgba(139, 159, 245, 0.25)',
    '0 8px 24px rgba(139, 159, 245, 0.3)',
    '0 12px 32px rgba(139, 159, 245, 0.35)',
    '0 16px 48px rgba(139, 159, 245, 0.4)',
    '0 24px 64px rgba(139, 159, 245, 0.45)',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: '15px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(139, 159, 245, 0.35)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7a8ef0 0%, #8a5ab0 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(139, 159, 245, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
  },
});
