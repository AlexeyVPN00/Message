import { PostsService } from '../../services/posts.service';
import { mockUser, mockPost } from '../setup';

// Mock dependencies
jest.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      increment: jest.fn(),
    })),
    transaction: jest.fn(),
  },
}));

jest.mock('../../utils/sanitize', () => ({
  sanitizeHtml: jest.fn((html) => html), // Just return input for tests
}));

describe('PostsService', () => {
  let postsService: PostsService;
  let mockPostRepository: any;
  let mockLikeRepository: any;
  let mockCommentRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPostRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      increment: jest.fn(),
    };

    mockLikeRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockCommentRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const { AppDataSource } = require('../../config/database');
    AppDataSource.getRepository.mockImplementation((entity: string) => {
      if (entity.name === 'Post') return mockPostRepository;
      if (entity.name === 'PostLike') return mockLikeRepository;
      if (entity.name === 'Comment') return mockCommentRepository;
      return mockPostRepository;
    });

    postsService = new PostsService();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const createDto = { content: 'Test post content' };
      const newPost = { ...mockPost };

      mockPostRepository.create.mockReturnValue(newPost);
      mockPostRepository.save.mockResolvedValue(newPost);

      // Mock getPostById
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...newPost, author: mockUser }),
      };
      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await postsService.createPost(mockUser.id, createDto);

      expect(result).toBeDefined();
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        authorId: mockUser.id,
        content: createDto.content,
      });
      expect(mockPostRepository.save).toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      const updateDto = { content: 'Updated content' };
      const existingPost = { ...mockPost };

      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.save.mockResolvedValue({ ...existingPost, content: updateDto.content });

      // Mock getPostById
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ ...existingPost, content: updateDto.content, author: mockUser }),
      };
      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await postsService.updatePost(mockPost.id, mockUser.id, updateDto);

      expect(result.content).toBe(updateDto.content);
      expect(mockPostRepository.save).toHaveBeenCalled();
    });

    it('should throw error if post not found', async () => {
      const updateDto = { content: 'Updated content' };

      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postsService.updatePost('nonexistent', mockUser.id, updateDto)).rejects.toThrow(
        'Пост не найден'
      );
    });

    it('should throw error if user is not author', async () => {
      const updateDto = { content: 'Updated content' };
      const existingPost = { ...mockPost, authorId: 'differentUserId' };

      mockPostRepository.findOne.mockResolvedValue(existingPost);

      await expect(postsService.updatePost(mockPost.id, mockUser.id, updateDto)).rejects.toThrow(
        'Только автор может редактировать пост'
      );
      expect(mockPostRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      const existingPost = { ...mockPost };

      mockPostRepository.findOne.mockResolvedValue(existingPost);
      mockPostRepository.remove.mockResolvedValue(existingPost);

      await postsService.deletePost(mockPost.id, mockUser.id);

      expect(mockPostRepository.remove).toHaveBeenCalledWith(existingPost);
    });

    it('should throw error if post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(postsService.deletePost('nonexistent', mockUser.id)).rejects.toThrow('Пост не найден');
      expect(mockPostRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw error if user is not author', async () => {
      const existingPost = { ...mockPost, authorId: 'differentUserId' };

      mockPostRepository.findOne.mockResolvedValue(existingPost);

      await expect(postsService.deletePost(mockPost.id, mockUser.id)).rejects.toThrow(
        'Только автор может удалить пост'
      );
      expect(mockPostRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('likePost', () => {
    it('should like post successfully', async () => {
      const { AppDataSource } = require('../../config/database');
      const mockTransactionalManager = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        increment: jest.fn(),
      };

      const newLike = { id: '1', postId: mockPost.id, userId: mockUser.id };

      // Mock transaction
      AppDataSource.transaction.mockImplementation(async (callback: any) => {
        mockTransactionalManager.findOne
          .mockResolvedValueOnce(mockPost) // Post exists
          .mockResolvedValueOnce(null); // Like doesn't exist

        mockTransactionalManager.create.mockReturnValue(newLike);
        mockTransactionalManager.save.mockResolvedValue(newLike);

        return await callback(mockTransactionalManager);
      });

      const result = await postsService.likePost(mockPost.id, mockUser.id);

      expect(result).toEqual(newLike);
      expect(mockTransactionalManager.increment).toHaveBeenCalled();
    });

    it('should return existing like if already liked', async () => {
      const { AppDataSource } = require('../../config/database');
      const mockTransactionalManager = {
        findOne: jest.fn(),
      };

      const existingLike = { id: '1', postId: mockPost.id, userId: mockUser.id };

      AppDataSource.transaction.mockImplementation(async (callback: any) => {
        mockTransactionalManager.findOne
          .mockResolvedValueOnce(mockPost) // Post exists
          .mockResolvedValueOnce(existingLike); // Like already exists

        return await callback(mockTransactionalManager);
      });

      const result = await postsService.likePost(mockPost.id, mockUser.id);

      expect(result).toEqual(existingLike);
    });

    it('should throw error if post not found', async () => {
      const { AppDataSource } = require('../../config/database');
      const mockTransactionalManager = {
        findOne: jest.fn(),
      };

      AppDataSource.transaction.mockImplementation(async (callback: any) => {
        mockTransactionalManager.findOne.mockResolvedValueOnce(null); // Post doesn't exist
        return await callback(mockTransactionalManager);
      });

      await expect(postsService.likePost('nonexistent', mockUser.id)).rejects.toThrow('Пост не найден');
    });
  });

  describe('unlikePost', () => {
    it('should unlike post successfully', async () => {
      const { AppDataSource } = require('../../config/database');
      const mockTransactionalManager = {
        findOne: jest.fn(),
        remove: jest.fn(),
        query: jest.fn(),
      };

      const existingLike = { id: '1', postId: mockPost.id, userId: mockUser.id };

      AppDataSource.transaction.mockImplementation(async (callback: any) => {
        mockTransactionalManager.findOne.mockResolvedValue(existingLike);
        mockTransactionalManager.remove.mockResolvedValue(existingLike);
        mockTransactionalManager.query.mockResolvedValue(undefined);

        return await callback(mockTransactionalManager);
      });

      await postsService.unlikePost(mockPost.id, mockUser.id);

      expect(mockTransactionalManager.remove).toHaveBeenCalledWith(existingLike);
      expect(mockTransactionalManager.query).toHaveBeenCalledWith(
        expect.stringContaining('GREATEST(likes_count - 1, 0)'),
        [mockPost.id]
      );
    });

    it('should throw error if like not found', async () => {
      const { AppDataSource } = require('../../config/database');
      const mockTransactionalManager = {
        findOne: jest.fn(),
      };

      AppDataSource.transaction.mockImplementation(async (callback: any) => {
        mockTransactionalManager.findOne.mockResolvedValue(null);
        return await callback(mockTransactionalManager);
      });

      await expect(postsService.unlikePost(mockPost.id, mockUser.id)).rejects.toThrow('Лайк не найден');
    });
  });
});
