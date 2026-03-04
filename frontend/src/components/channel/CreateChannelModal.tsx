import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useChannelStore } from '../../store/channelStore';

interface CreateChannelModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (channelId: string) => void;
}

export const CreateChannelModal = ({ open, onClose, onCreated }: CreateChannelModalProps) => {
  const { createChannel } = useChannelStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setIsPrivate(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    try {
      const channel = await createChannel(name.trim(), description.trim() || undefined, isPrivate);
      if (channel) {
        handleClose();
        if (onCreated) {
          onCreated(channel.id);
        }
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Создать канал
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Название канала"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            inputProps={{ maxLength: 100 }}
            helperText={`${name.length}/100`}
            disabled={loading}
          />

          <TextField
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 500 }}
            helperText={`${description.length}/500`}
            disabled={loading}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={loading}
              />
            }
            label="Приватный канал (доступен только по приглашению)"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? 'Создание...' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
