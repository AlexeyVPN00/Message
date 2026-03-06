import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component для перехвата ошибок в React компонентах
 * Предотвращает падение всего приложения при ошибке в одном компоненте
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Обновляем state, чтобы следующий рендер показал fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Логируем ошибку в консоль для debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Вызываем кастомный обработчик если он передан
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // В production можно отправлять ошибки в сервис мониторинга (Sentry, LogRocket и т.д.)
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Если передан custom fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}
          >
            ⚠️
          </div>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 600 }}>
            Что-то пошло не так
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem', maxWidth: '500px' }}>
            Произошла ошибка при загрузке этого компонента. Попробуйте обновить страницу или вернуться назад.
          </p>
          {this.state.error && (
            <details style={{ marginBottom: '1.5rem', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 500 }}>
                Детали ошибки
              </summary>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  color: '#d32f2f',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Попробовать снова
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#fff',
                color: '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Компактный Error Boundary для небольших секций UI
 */
export const CompactErrorBoundary: React.FC<Props> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={
        <div
          style={{
            padding: '1rem',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404',
          }}
        >
          <strong>⚠️ Ошибка загрузки</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Не удалось загрузить этот компонент. Попробуйте обновить страницу.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
