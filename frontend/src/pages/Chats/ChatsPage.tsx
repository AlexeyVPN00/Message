import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, IconButton, Divider, Fab, Menu, MenuItem } from '@mui/material';
import { GroupAdd, Settings, People, MoreVert } from '@mui/icons-material';
import { ChatList } from '../../components/chat/ChatList';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { CreateGroupChatModal } from '../../components/chat/CreateGroupChatModal';
import { GroupSettingsModal } from '../../components/chat/GroupSettingsModal';
import { MembersManagementModal } from '../../components/chat/MembersManagementModal';
import { UserProfileModal } from '../../components/profile/UserProfileModal';
import { MainLayout } from '../../layouts/MainLayout';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../contexts/SocketContext';
import { Avatar } from '../../components/common/Avatar';
import { ChatType, MemberRole } from '../../types/chat.types';
import { useAuthStore } from '../../store/authStore';
import { CompactErrorBoundary } from '../../components/common/ErrorBoundary';

export const ChatsPage = () => {
  const { socket } = useSocket();
  const { user } = useAuthStore();
  const { currentChatId, setCurrentChat, chats, setSocket, loadChats } = useChatStore();
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [groupSettingsModalOpen, setGroupSettingsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const currentChat = chats.find((c) => c.id === currentChatId);
  const currentUserMember = currentChat?.members.find((m) => m.userId === user?.id);
  const isGroupOwner = currentUserMember?.role === MemberRole.OWNER;
  const isGroupAdmin = currentUserMember?.role === MemberRole.ADMIN;
  const canManageGroup = isGroupOwner || isGroupAdmin;

  // Передаем socket в store
  useEffect(() => {
    setSocket(socket);
  }, [socket, setSocket]);

  // Получаем имя и аватар текущего чата
  const getChatInfo = () => {
    if (!currentChat) return { name: '', avatar: undefined, otherUser: undefined };

    if (currentChat.type === ChatType.PRIVATE) {
      const otherUser = currentChat.members.find((m) => m.userId !== user?.id)?.user;
      return {
        name: otherUser?.username || 'Неизвестный',
        avatar: otherUser?.avatarUrl,
        isOnline: otherUser?.isOnline,
        otherUser,
      };
    }

    return {
      name: currentChat.name || 'Группа',
      avatar: currentChat.avatarUrl,
      isOnline: false,
      otherUser: undefined,
    };
  };

  const chatInfo = getChatInfo();

  const handleOpenUserProfile = () => {
    if (currentChat?.type === ChatType.PRIVATE) {
      setUserProfileModalOpen(true);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleOpenSettings = () => {
    setGroupSettingsModalOpen(true);
    handleMenuClose();
  };

  const handleOpenMembers = () => {
    setMembersModalOpen(true);
    handleMenuClose();
  };

  const handleMembersChanged = async () => {
    await loadChats();
  };

  return (
    <MainLayout>
      <Box sx={{ height: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
        {/* Основной контент */}
        <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Сайдбар с чатами */}
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          sx={{
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
          }}
        >
          <CompactErrorBoundary>
            <ChatList onChatSelect={setCurrentChat} selectedChatId={currentChatId} />
          </CompactErrorBoundary>

          {/* Кнопка создания группы */}
          <Fab
            color="primary"
            aria-label="создать группу"
            onClick={() => setCreateGroupModalOpen(true)}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
            }}
          >
            <GroupAdd />
          </Fab>
        </Grid>

        {/* Область чата */}
        <Grid
          item
          xs={12}
          sm={8}
          md={9}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {currentChatId ? (
            <>
              {/* Шапка чата */}
              <Paper
                square
                elevation={1}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flex: 1,
                    cursor: currentChat?.type === ChatType.PRIVATE ? 'pointer' : 'default',
                    '&:hover': currentChat?.type === ChatType.PRIVATE ? {
                      opacity: 0.8,
                    } : {},
                  }}
                  onClick={currentChat?.type === ChatType.PRIVATE ? handleOpenUserProfile : undefined}
                >
                  <Avatar src={chatInfo.avatar || undefined} alt={chatInfo.name} size={40} online={chatInfo.isOnline} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {chatInfo.name}
                    </Typography>
                    {currentChat?.type === ChatType.GROUP ? (
                      <Typography variant="caption" color="text.secondary">
                        {currentChat.members.length} участников
                      </Typography>
                    ) : (
                      chatInfo.isOnline !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          {chatInfo.isOnline ? 'Онлайн' : 'Оффлайн'}
                        </Typography>
                      )
                    )}
                  </Box>
                </Box>
                {currentChat?.type === ChatType.GROUP && (
                  <>
                    <IconButton onClick={handleMenuOpen}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl)}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={handleOpenMembers}>
                        <People sx={{ mr: 1 }} />
                        Участники
                      </MenuItem>
                      {canManageGroup && (
                        <MenuItem onClick={handleOpenSettings}>
                          <Settings sx={{ mr: 1 }} />
                          Настройки группы
                        </MenuItem>
                      )}
                    </Menu>
                  </>
                )}
              </Paper>

              <Divider />

              {/* Сообщения */}
              <CompactErrorBoundary>
                <MessageList chatId={currentChatId} />
              </CompactErrorBoundary>

              {/* Поле ввода */}
              <MessageInput chatId={currentChatId} />
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Выберите чат для начала общения
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Модальное окно создания группы */}
      <CreateGroupChatModal
        open={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        onCreated={(chatId) => {
          setCurrentChat(chatId);
          setCreateGroupModalOpen(false);
        }}
      />

      {/* Модальное окно настроек группы */}
      {currentChat && currentChat.type === ChatType.GROUP && (
        <>
          <GroupSettingsModal
            open={groupSettingsModalOpen}
            onClose={() => setGroupSettingsModalOpen(false)}
            chat={currentChat}
          />
          <MembersManagementModal
            open={membersModalOpen}
            onClose={() => setMembersModalOpen(false)}
            chat={currentChat}
            onMembersChanged={handleMembersChanged}
          />
        </>
      )}

      {/* Модальное окно профиля пользователя */}
      {currentChat && currentChat.type === ChatType.PRIVATE && chatInfo.otherUser && (
        <UserProfileModal
          open={userProfileModalOpen}
          onClose={() => setUserProfileModalOpen(false)}
          user={chatInfo.otherUser}
        />
      )}
    </Box>
    </MainLayout>
  );
};
