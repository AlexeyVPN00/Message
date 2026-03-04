import { useState } from 'react';
import { Paper, TextField, Button, Box } from '@mui/material';
import { useFeedStore } from '../../store/feedStore';

export const CreatePostForm = () => {
  const { createPost } = useFeedStore();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await createPost(content.trim());
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <TextField
        placeholder="Что у вас нового?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        fullWidth
        multiline
        rows={3}
        disabled={submitting}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
        >
          {submitting ? 'Публикация...' : 'Опубликовать'}
        </Button>
      </Box>
    </Paper>
  );
};
