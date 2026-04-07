'use client';

import { ToastProvider } from '@/components/Toast';
import { AdminConfirmProvider } from '@/components/AdminConfirm';
import { ReactNode } from 'react';

export default function AdminToastWrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AdminConfirmProvider>{children}</AdminConfirmProvider>
    </ToastProvider>
  );
}
