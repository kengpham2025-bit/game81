import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import PasswordFormClient from './PasswordFormClient';

export default async function AdminPasswordPage() {
  const user = await getAdminUser();
  if (!user) redirect('/admin/login');

  return <PasswordFormClient defaultEmail={user.email} />;
}
