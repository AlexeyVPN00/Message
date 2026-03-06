/**
 * Normalize and validate UTF-8 filename
 * Ensures valid UTF-8 encoding and removes control characters
 */
export function normalizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }

  // Fix encoding corruption by round-tripping through Buffer
  const buffer = Buffer.from(filename, 'utf8');
  let normalized = buffer.toString('utf8');

  // Remove control characters but preserve Unicode
  normalized = normalized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  normalized = normalized.trim();

  // Validate length (database limit is 255)
  if (normalized.length === 0) {
    throw new Error('Filename cannot be empty');
  }

  if (normalized.length > 255) {
    // Preserve extension, truncate name
    const ext = normalized.substring(normalized.lastIndexOf('.'));
    const name = normalized.substring(0, 255 - ext.length - 3) + '...';
    normalized = name + ext;
  }

  return normalized;
}
