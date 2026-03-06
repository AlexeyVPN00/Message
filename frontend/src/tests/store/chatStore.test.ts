import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChatStore } from '../../store/chatStore';
import { mockChat, mockMessage, mockUser } from '../setup';
import type { Socket } from 'socket.io-client';

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useChatStore.getState();
    store.cleanup();
    useChatStore.setState({
      chats: [],
      messages: [],
      currentChatId: null,
      isLoadingChats: false,
      isLoadingMessages: false,
      typingUsers: {},
      typingTimers: {},
      socket: null,
    });
  });

  describe('setCurrentChat', () => {
    it('should set current chat ID', () => {
      const { setCurrentChat, currentChatId } = useChatStore.getState();

      setCurrentChat(mockChat.id);

      const updatedState = useChatStore.getState();
      expect(updatedState.currentChatId).toBe(mockChat.id);
    });

    it('should set to null when called with null', () => {
      const { setCurrentChat } = useChatStore.getState();

      setCurrentChat(mockChat.id);
      setCurrentChat(null);

      const updatedState = useChatStore.getState();
      expect(updatedState.currentChatId).toBeNull();
    });
  });

  describe('setChats', () => {
    it('should set chats array', () => {
      const { setChats } = useChatStore.getState();
      const chats = [mockChat];

      setChats(chats);

      const updatedState = useChatStore.getState();
      expect(updatedState.chats).toEqual(chats);
      expect(updatedState.chats).toHaveLength(1);
    });

    it('should replace existing chats', () => {
      const { setChats } = useChatStore.getState();
      const chats1 = [mockChat];
      const chats2 = [{ ...mockChat, id: 'different-id' }];

      setChats(chats1);
      setChats(chats2);

      const updatedState = useChatStore.getState();
      expect(updatedState.chats).toEqual(chats2);
      expect(updatedState.chats).toHaveLength(1);
    });
  });

  describe('addMessage', () => {
    it('should add new message to messages array', () => {
      const { addMessage } = useChatStore.getState();

      addMessage(mockMessage);

      const updatedState = useChatStore.getState();
      expect(updatedState.messages).toContainEqual(mockMessage);
      expect(updatedState.messages).toHaveLength(1);
    });

    it('should add multiple messages', () => {
      const { addMessage } = useChatStore.getState();
      const message2 = { ...mockMessage, id: 'different-id', content: 'Second message' };

      addMessage(mockMessage);
      addMessage(message2);

      const updatedState = useChatStore.getState();
      expect(updatedState.messages).toHaveLength(2);
      expect(updatedState.messages).toContainEqual(mockMessage);
      expect(updatedState.messages).toContainEqual(message2);
    });

    it('should not add duplicate message with same ID', () => {
      const { addMessage } = useChatStore.getState();

      addMessage(mockMessage);
      addMessage(mockMessage); // Try to add again

      const updatedState = useChatStore.getState();
      expect(updatedState.messages).toHaveLength(1);
    });
  });

  describe('updateMessage', () => {
    it('should update existing message', () => {
      const { addMessage, updateMessage } = useChatStore.getState();

      addMessage(mockMessage);
      updateMessage(mockMessage.id, { content: 'Updated content', isEdited: true });

      const updatedState = useChatStore.getState();
      const message = updatedState.messages.find((m) => m.id === mockMessage.id);
      expect(message?.content).toBe('Updated content');
      expect(message?.isEdited).toBe(true);
    });

    it('should not update if message does not exist', () => {
      const { updateMessage } = useChatStore.getState();

      updateMessage('nonexistent-id', { content: 'Updated content' });

      const updatedState = useChatStore.getState();
      expect(updatedState.messages).toHaveLength(0);
    });
  });

  describe('deleteMessage', () => {
    it('should mark message as deleted', () => {
      const { addMessage, deleteMessage } = useChatStore.getState();

      addMessage(mockMessage);
      deleteMessage(mockMessage.id);

      const updatedState = useChatStore.getState();
      const message = updatedState.messages.find((m) => m.id === mockMessage.id);
      expect(message?.isDeleted).toBe(true);
      expect(message?.content).toBe('Сообщение удалено');
    });
  });

  describe('handleTyping', () => {
    it('should add user to typing users', () => {
      const { handleTyping } = useChatStore.getState();

      handleTyping(mockChat.id, mockUser.id, mockUser.username);

      const updatedState = useChatStore.getState();
      const typingKey = `${mockChat.id}:${mockUser.id}`;
      expect(updatedState.typingUsers[typingKey]).toEqual({
        userId: mockUser.id,
        username: mockUser.username,
      });
    });

    it('should create timer for typing user', () => {
      const { handleTyping } = useChatStore.getState();

      handleTyping(mockChat.id, mockUser.id, mockUser.username);

      const updatedState = useChatStore.getState();
      const timerKey = `${mockChat.id}:${mockUser.id}`;
      expect(updatedState.typingTimers[timerKey]).toBeDefined();
    });
  });

  describe('handleStopTyping', () => {
    it('should remove user from typing users', () => {
      const { handleTyping, handleStopTyping } = useChatStore.getState();

      handleTyping(mockChat.id, mockUser.id, mockUser.username);
      handleStopTyping(mockChat.id, mockUser.id);

      const updatedState = useChatStore.getState();
      const typingKey = `${mockChat.id}:${mockUser.id}`;
      expect(updatedState.typingUsers[typingKey]).toBeUndefined();
    });
  });

  describe('cleanup', () => {
    it('should clear all timers and disconnect socket', () => {
      const mockSocket = {
        off: vi.fn(),
        disconnect: vi.fn(),
        on: vi.fn(),
        emit: vi.fn(),
        removeAllListeners: vi.fn(),
      } as unknown as Socket;

      const { setSocket, handleTyping, cleanup } = useChatStore.getState();

      setSocket(mockSocket);
      handleTyping(mockChat.id, mockUser.id, mockUser.username);

      cleanup();

      const updatedState = useChatStore.getState();
      expect(updatedState.socket).toBeNull();
      expect(updatedState.typingTimers).toEqual({});
      expect(updatedState.typingUsers).toEqual({});
      expect(mockSocket.off).toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('socket integration', () => {
    it('should set socket and attach listeners', () => {
      const mockSocket = {
        off: vi.fn(),
        on: vi.fn(),
        disconnect: vi.fn(),
        emit: vi.fn(),
        removeAllListeners: vi.fn(),
      } as unknown as Socket;

      const { setSocket } = useChatStore.getState();

      setSocket(mockSocket);

      const updatedState = useChatStore.getState();
      expect(updatedState.socket).toBe(mockSocket);
      expect(mockSocket.on).toHaveBeenCalled();
    });

    it('should remove old socket listeners before adding new ones', () => {
      const mockSocket1 = {
        off: vi.fn(),
        on: vi.fn(),
        disconnect: vi.fn(),
        emit: vi.fn(),
        removeAllListeners: vi.fn(),
      } as unknown as Socket;

      const mockSocket2 = {
        off: vi.fn(),
        on: vi.fn(),
        disconnect: vi.fn(),
        emit: vi.fn(),
        removeAllListeners: vi.fn(),
      } as unknown as Socket;

      const { setSocket } = useChatStore.getState();

      setSocket(mockSocket1);
      setSocket(mockSocket2);

      expect(mockSocket1.off).toHaveBeenCalled();
      expect(mockSocket2.on).toHaveBeenCalled();
    });
  });
});
