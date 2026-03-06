/**
 * Utility functions for error handling and HTTP status code determination
 */

/**
 * Определить правильный HTTP статус-код на основе сообщения об ошибке
 *
 * @param error - Error object or string message
 * @returns Appropriate HTTP status code
 *
 * HTTP Status Codes:
 * - 400: Bad Request (validation errors, invalid input)
 * - 401: Unauthorized (authentication failed, invalid token, session expired)
 * - 403: Forbidden (authenticated but insufficient permissions)
 * - 404: Not Found (resource doesn't exist)
 * - 409: Conflict (duplicate resource, constraint violation)
 * - 500: Internal Server Error (unexpected errors)
 */
export function getErrorStatusCode(error: Error | string): number {
  const message = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();

  // 404 Not Found - ресурс не найден
  if (
    message.includes('не найден') ||
    message.includes('not found') ||
    message.includes('does not exist')
  ) {
    return 404;
  }

  // 403 Forbidden - есть токен, но нет прав
  if (
    message.includes('только автор') ||
    message.includes('только владелец') ||
    message.includes('недостаточно прав') ||
    message.includes('нет прав') ||
    message.includes('не являетесь участником') ||
    message.includes('доступ запрещен') ||
    message.includes('only author') ||
    message.includes('only owner') ||
    message.includes('insufficient permissions') ||
    message.includes('forbidden') ||
    message.includes('not a member')
  ) {
    return 403;
  }

  // 409 Conflict - дубликат или конфликт ресурсов
  if (
    message.includes('уже существует') ||
    message.includes('already exists') ||
    message.includes('уже лайкнут') ||
    message.includes('already liked') ||
    message.includes('дубликат') ||
    message.includes('duplicate')
  ) {
    return 409;
  }

  // 400 Bad Request - ошибки валидации
  if (
    message.includes('некорректн') ||
    message.includes('неправильн') ||
    message.includes('invalid') ||
    message.includes('должн') ||
    message.includes('required') ||
    message.includes('missing')
  ) {
    return 400;
  }

  // 401 Unauthorized - аутентификация не удалась (редкий случай, обычно обрабатывается middleware)
  // Обычно эти ошибки не доходят до контроллера, т.к. auth middleware блокирует запрос
  if (
    message.includes('не авторизован') ||
    message.includes('unauthorized') ||
    message.includes('invalid token') ||
    message.includes('authentication failed')
  ) {
    return 401;
  }

  // По умолчанию 500 - Internal Server Error для неожиданных ошибок
  return 500;
}

/**
 * Форматировать ответ с ошибкой
 *
 * @param error - Error object or string message
 * @param defaultMessage - Default message if error is not an Error object
 * @returns Formatted error response object
 */
export function formatErrorResponse(error: Error | string, defaultMessage: string = 'Произошла ошибка') {
  const message = typeof error === 'string' ? error : (error.message || defaultMessage);
  const statusCode = getErrorStatusCode(error);

  return {
    statusCode,
    response: {
      error: getErrorName(statusCode),
      message,
    },
  };
}

/**
 * Получить название ошибки по статус-коду
 */
function getErrorName(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 500:
      return 'Internal Server Error';
    default:
      return 'Error';
  }
}
