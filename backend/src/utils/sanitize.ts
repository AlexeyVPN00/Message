/**
 * Sanitization utilities to prevent XSS attacks
 * These functions escape HTML special characters
 */

/**
 * Sanitize HTML content by escaping special characters
 * Prevents XSS attacks by converting HTML entities
 *
 * @param text - Input text that may contain HTML
 * @returns Sanitized text with escaped HTML entities
 *
 * @example
 * sanitizeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export const sanitizeHtml = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize multiple strings in an object
 * Recursively sanitizes all string values
 *
 * @param obj - Object with string values to sanitize
 * @returns Object with all string values sanitized
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeHtml(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeHtml(item) : item
      );
    } else {
      result[key] = value;
    }
  }

  return result as T;
};

/**
 * Remove null bytes from string (SQL injection prevention)
 *
 * @param text - Input text
 * @returns Text without null bytes
 */
export const removeNullBytes = (text: string): string => {
  if (typeof text !== 'string') {
    return '';
  }

  return text.replace(/\0/g, '');
};

/**
 * Trim whitespace and limit string length
 *
 * @param text - Input text
 * @param maxLength - Maximum allowed length
 * @returns Trimmed and truncated text
 */
export const sanitizeString = (text: string, maxLength: number = 10000): string => {
  if (typeof text !== 'string') {
    return '';
  }

  return removeNullBytes(text.trim()).slice(0, maxLength);
};
