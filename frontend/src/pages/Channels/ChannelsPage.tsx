import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Fab,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useChannelStore } from '../../store/channelStore';
import { ChannelCard } from '../../components/channel/ChannelCard';
import { CreateChannelModal } from '../../components/channel/CreateChannelModal';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { NotificationBadge } from '../../components/notifications/NotificationBadge';

export const ChannelsPage = () => {
  const navigate = useNavigate();
  const { channels, subscriptions, isLoading, loadChannels, loadSubscriptions, subscribe, unsubscribe } =
    useChannelStore();
  const [tabValue, setTabValue] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadChannels();
    loadSubscriptions();
  }, [loadChannels, loadSubscriptions]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubscribe = async (channelId: string) => {
    try {
      await subscribe(channelId);
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleUnsubscribe = async (channelId: string) => {
    try {
      await unsubscribe(channelId);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const displayedChannels = tabValue === 0 ? channels : subscriptions;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Шапка */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Каналы
          </Typography>
          <NotificationBadge />
          <ThemeToggle />
        </Toolbar>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        >
          <Tab label="Все каналы" />
          <Tab label="Мои подписки" />
        </Tabs>
      </AppBar>

      {/* Контент */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : displayedChannels.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                {tabValue === 0 ? 'Нет доступных каналов' : 'Вы не подписаны ни на один канал'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {displayedChannels.map((channel) => (
                <Grid item xs={12} sm={6} md={4} key={channel.id}>
                  <ChannelCard
                    channel={channel}
                    onSubscribe={handleSubscribe}
                    onUnsubscribe={handleUnsubscribe}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Кнопка создания канала */}
      <Fab
        color="primary"
        aria-label="создать канал"
        onClick={() => setCreateModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Add />
      </Fab>

      {/* Модальное окно создания канала */}
      <CreateChannelModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(channelId) => {
          setCreateModalOpen(false);
          navigate(`/channels/${channelId}`);
        }}
      />
    </Box>
  );
};
