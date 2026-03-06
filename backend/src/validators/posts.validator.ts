import { z } from 'zod';

/**
 * Validation schemas for posts and comments
 */

// UUID validation
const uuidSchema = z.string().uuid('Некорректный формат ID');

/**
 * POST /api/posts
 * Create new post
 */
export const createPostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Пост не может быть пустым')
      .max(5000, 'Пост не может превышать 5000 символов')
      .trim(),
  }),
});

/**
 * PUT /api/posts/:postId
 * Update existing post
 */
export const updatePostSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Пост не может быть пустым')
      .max(5000, 'Пост не может превышать 5000 символов')
      .trim(),
  }),
  params: z.object({
    postId: uuidSchema,
  }),
});

/**
 * DELETE /api/posts/:postId
 * Delete post
 */
export const deletePostSchema = z.object({
  params: z.object({
    postId: uuidSchema,
  }),
});

/**
 * GET /api/posts/:postId
 * Get single post
 */
export const getPostSchema = z.object({
  params: z.object({
    postId: uuidSchema,
  }),
});

/**
 * POST /api/posts/:postId/comments
 * Create comment on post
 */
export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Комментарий не может быть пустым')
      .max(1000, 'Комментарий не может превышать 1000 символов')
      .trim(),
    replyToCommentId: uuidSchema.optional(),
  }),
  params: z.object({
    postId: uuidSchema,
  }),
});

/**
 * PUT /api/comments/:commentId
 * Update comment
 */
export const updateCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, 'Комментарий не может быть пустым')
      .max(1000, 'Комментарий не может превышать 1000 символов')
      .trim(),
  }),
  params: z.object({
    commentId: uuidSchema,
  }),
});

/**
 * DELETE /api/comments/:commentId
 * Delete comment
 */
export const deleteCommentSchema = z.object({
  params: z.object({
    commentId: uuidSchema,
  }),
});

/**
 * POST /api/posts/:postId/like
 * Like post
 */
export const likePostSchema = z.object({
  params: z.object({
    postId: uuidSchema,
  }),
});

/**
 * DELETE /api/posts/:postId/like
 * Unlike post
 */
export const unlikePostSchema = z.object({
  params: z.object({
    postId: uuidSchema,
  }),
});

/**
 * GET /api/posts
 * Get feed posts with pagination
 */
export const getPostsSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .pipe(z.number().int().min(1).max(50)),
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 0))
      .pipe(z.number().int().min(0)),
  }),
});

// Type exports
export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>['body'];
export type GetPostsQuery = z.infer<typeof getPostsSchema>['query'];
