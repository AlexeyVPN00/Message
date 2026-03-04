import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
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
