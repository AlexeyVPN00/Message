import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuthStore } from './store/authStore';

function App() {
  const loadUser = useAuthStore((state) => state.loadUser);

  // Загрузить пользователя при старте приложения, если есть токен
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <Toaster position="top-right" />
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
