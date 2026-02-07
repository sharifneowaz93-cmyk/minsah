'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import AdminLayoutWrapper from './AdminLayoutWrapper';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Don't wrap login page with AdminLayoutWrapper
  if (isLoginPage) {
    return <AdminAuthProvider>{children}</AdminAuthProvider>;
  }

  return (
    <AdminAuthProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </AdminAuthProvider>
  );
}
