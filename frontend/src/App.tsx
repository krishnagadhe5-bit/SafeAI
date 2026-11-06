import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from '@/hooks/useAuth';
import { AppLayout } from '@/components';
import {
  Dashboard,
  RiskPrediction,
  AssessmentHistory,
  ResourcePlanning,
  Reports,
  About,
  Settings,
  Login,
  Register,
} from '@/pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'text-xs font-medium',
              duration: 3500,
              style: {
                borderRadius: '0.5rem',
                background: '#1e293b',
                color: '#f8fafc',
              },
            }}
          />
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected application routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="predict" element={<RiskPrediction />} />
              <Route path="history" element={<AssessmentHistory />} />
              <Route path="resources" element={<ResourcePlanning />} />
              <Route path="reports" element={<Reports />} />
              <Route path="about" element={<About />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

