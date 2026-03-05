import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Lazy load всех страниц для code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/Auth/Login').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/Auth/Register').then(m => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const EditProfile = lazy(() => import('./pages/Profile/EditProfile').then(m => ({ default: m.EditProfile })));
const ChatsPage = lazy(() => import('./pages/Chats/ChatsPage').then(m => ({ default: m.ChatsPage })));
const ContactsPage = lazy(() => import('./pages/Contacts/ContactsPage').then(m => ({ default: m.ContactsPage })));
const ChannelsPage = lazy(() => import('./pages/Channels/ChannelsPage').then(m => ({ default: m.ChannelsPage })));
const ChannelView = lazy(() => import('./pages/Channels/ChannelView').then(m => ({ default: m.ChannelView })));
const FeedPage = lazy(() => import('./pages/Feed/FeedPage').then(m => ({ default: m.FeedPage })));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// Loading fallback компонент
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <ChatsPage />
          </ProtectedRoute>
        }
      />

      {/* Contacts route */}
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <ContactsPage />
          </ProtectedRoute>
        }
      />

      {/* Profile routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Channels routes */}
      <Route
        path="/channels"
        element={
          <ProtectedRoute>
            <ChannelsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/channels/:channelId"
        element={
          <ProtectedRoute>
            <ChannelView />
          </ProtectedRoute>
        }
      />

      {/* Feed route */}
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        }
      />

      {/* Notifications route */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
};
