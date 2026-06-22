import { Suspense } from 'react';
import { AuthForm } from '@/components/Auth/AuthForm';

export const metadata = { title: 'Đăng nhập — VocaNight' };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm initialMode="login" />
    </Suspense>
  );
}
