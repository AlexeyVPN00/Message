import { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, CircularProgress } from '@mui/material';
import { Send, AttachFile } from '@mui/icons-material';
import { useChatStore } from '../../store/chatStore';
import { uploadApi } from '../../api/upload.api';
import { AttachmentPreview } from './AttachmentPreview';
import toast from 'react-hot-toast';

interface MessageInputProps {
  chatId: string;
}

export const MessageInput = ({ chatId }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sendMessage, emitTyping, emitStopTyping } = useChatStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Отправляем событие "печатает"
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(chatId);
    }

    // Сбрасываем таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Отправляем "прекратил печатать" через 2 секунды после последнего ввода
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(chatId);
    }, 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Validate max 5 files
      if (selectedFiles.length + files.length > 5) {
        toast.error('Максимум 5 файлов за раз');
        return;
      }

      // Validate file sizes (10MB max)
      const invalidFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error('Размер файла не должен превышать 10MB');
        return;
      }

      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim().length === 0 && selectedFiles.length === 0) {
      return;
    }

    setUploading(true);

    try {
      let attachments;

      // Upload files if any
      if (selectedFiles.length > 0) {
        const uploadResult = await uploadApi.uploadMessageFiles(selectedFiles);
        attachments = uploadResult.files;
      }

      // Send message with attachments
      sendMessage(chatId, message.trim() || undefined, undefined, attachments);

      // Reset state
      setMessage('');
      setSelectedFiles([]);

      if (isTyping) {
        setIsTyping(false);
        emitStopTyping(chatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка при отправке сообщения');
    } finally {
      setUploading(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        emitStopTyping(chatId);
      }
    };
  }, [chatId, isTyping, emitStopTyping]);

  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'background.paper',
      }}
    >
      {/* File previews */}
      {selectedFiles.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 2,
            pb: 0,
            overflowX: 'auto',
            maxWidth: '900px',
            mx: 'auto',
            width: '100%',
          }}
        >
          {selectedFiles.map((file, index) => (
            <AttachmentPreview key={index} file={file} onRemove={() => handleRemoveFile(index)} />
          ))}
        </Box>
      )}

      {/* Input area */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '900px',
          mx: 'auto',
          p: 2,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          style={{ display: 'none' }}
        />

        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || selectedFiles.length >= 5}
          sx={{ mb: 0.5 }}
        >
          <AttachFile />
        </IconButton>

        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Напишите сообщение..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          disabled={uploading}
        />

        <IconButton
          type="submit"
          color="primary"
          disabled={uploading || (message.trim().length === 0 && selectedFiles.length === 0)}
          sx={{ mb: 0.5 }}
        >
          {uploading ? <CircularProgress size={24} /> : <Send />}
        </IconButton>
      </Paper>
    </Box>
  );
};
