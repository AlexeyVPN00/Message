import { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Paper,
  Container,
} from '@mui/material';
import { Search, Message, Delete } from '@mui/icons-material';
import { Avatar } from '../../components/common/Avatar';
import { UserProfileModal } from '../../components/profile/UserProfileModal';
import { contactsApi, Contact } from '../../api/contacts.api';
import { useChatStore } from '../../store/chatStore';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import toast from 'react-hot-toast';

export const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Contact['contact'] | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const { createPrivateChat } = useChatStore();
  const navigate = useNavigate();

  // Загрузка контактов
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactsApi.getContacts();
      setContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Ошибка при загрузке контактов');
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация контактов при поиске
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter((contact) => {
      const user = contact.contact;
      return (
        user.username.toLowerCase().includes(query) ||
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query)
      );
    });

    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const handleContactClick = (contact: Contact) => {
    setSelectedUser(contact.contact);
    setProfileModalOpen(true);
  };

  const handleStartChat = async () => {
    if (!selectedUser) return;

    try {
      const chat = await createPrivateChat(selectedUser.id);
      if (chat) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Ошибка при создании чата');
    }
  };

  const handleRemoveContact = async (contactId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await contactsApi.removeContact(contactId);
      setContacts(contacts.filter((c) => c.contactId !== contactId));
      toast.success('Контакт удален');
    } catch (error) {
      console.error('Error removing contact:', error);
      toast.error('Ошибка при удалении контакта');
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100vh - 200px)',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={1} sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
              sx={{
                p: 3,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Контакты
              </Typography>

              {/* Search */}
              <TextField
                fullWidth
                size="small"
                placeholder="Поиск контактов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

          {/* Contacts List */}
          {filteredContacts.length > 0 ? (
            <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
              {filteredContacts.map((contact) => (
                <ListItem
                  key={contact.id}
                  disablePadding
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="message"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const chat = await createPrivateChat(contact.contactId);
                            if (chat) {
                              navigate('/chats');
                            }
                          } catch (error) {
                            console.error('Error creating chat:', error);
                            toast.error('Ошибка при создании чата');
                          }
                        }}
                        sx={{ mr: 1 }}
                      >
                        <Message />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => handleRemoveContact(contact.contactId, e)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemButton onClick={() => handleContactClick(contact)}>
                    <ListItemAvatar>
                      <Avatar
                        src={contact.contact.avatarUrl || undefined}
                        alt={contact.contact.username}
                        size={48}
                        online={contact.contact.isOnline}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {contact.contact.firstName || contact.contact.lastName
                            ? `${contact.contact.firstName || ''} ${contact.contact.lastName || ''}`.trim()
                            : contact.contact.username}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          @{contact.contact.username}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
              }}
            >
              <Typography variant="body1" color="text.secondary" align="center">
                {searchQuery ? 'Ничего не найдено' : 'У вас пока нет контактов'}
                <br />
                <Typography variant="caption" color="text.secondary">
                  {searchQuery
                    ? 'Попробуйте изменить запрос'
                    : 'Добавьте пользователей в контакты из профиля'}
                </Typography>
              </Typography>
            </Box>
          )}

            {/* User Profile Modal */}
            {selectedUser && (
              <UserProfileModal
                open={profileModalOpen}
                onClose={() => {
                  setProfileModalOpen(false);
                  setSelectedUser(null);
                }}
                user={selectedUser}
                onStartChat={handleStartChat}
              />
            )}
          </Paper>
        )}
      </Container>
    </MainLayout>
  );
};
