import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, AppBar, Toolbar, IconButton, Divider, Fab, Menu, MenuItem } from '@mui/material';
import { ArrowBack, Menu as MenuIcon, Add, GroupAdd, Settings, People, MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ChatList } from '../../components/chat/ChatList';
import { MessageList } from '../../components/chat/MessageList';
import { MessageInput } from '../../components/chat/MessageInput';
import { CreateGroupChatModal } from '../../components/chat/CreateGroupChatModal';
import { GroupSettingsModal } from '../../components/chat/GroupSettingsModal';
import { MembersManagementModal } from '../../components/chat/MembersManagementModal';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { NotificationBadge } from '../../components/notifications/NotificationBadge';
import { useChatStore } from '../../store/chatStore';
import { useSocket } from '../../contexts/SocketContext';
import { Avatar } from '../../components/common/Avatar';
import { ChatType, MemberRole } from '../../types/chat.types';
import { useAuthStore } from '../../store/authStore';

export const ChatsPage = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();
  const { currentChatId, setCurrentChat, chats, setSocket, loadChats } = useChatStore();
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [groupSettingsModalOpen, setGroupSettingsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
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
    if (!currentChat) return { name: '', avatar: undefined };

    if (currentChat.type === ChatType.PRIVATE) {
      const otherUser = currentChat.members.find((m) => m.userId !== user?.id)?.user;
      return {
        name: otherUser?.username || 'Неизвестный',
        avatar: otherUser?.avatarUrl,
        isOnline: otherUser?.isOnline,
      };
    }

    return {
      name: currentChat.name || 'Группа',
      avatar: currentChat.avatarUrl,
      isOnline: false,
    };
  };

  const chatInfo = getChatInfo();

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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Шапка */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Чаты
          </Typography>
          {!isConnected && (
            <Typography variant="caption" color="error" sx={{ mr: 2 }}>
              Нет подключения
            </Typography>
          )}
          <NotificationBadge />
          <ThemeToggle />
        </Toolbar>
      </AppBar>

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
          <ChatList onChatSelect={setCurrentChat} selectedChatId={currentChatId} />

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
                <Avatar src={chatInfo.avatar} alt={chatInfo.name} size={40} online={chatInfo.isOnline} />
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
              <MessageList chatId={currentChatId} />

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
    </Box>
  );
};
