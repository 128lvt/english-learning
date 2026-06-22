import { Suspense } from 'react';
import { AuthForm } from '@/components/Auth/AuthForm';

export const metadata = { title: 'Đăng ký — VocaNight' };

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm initialMode="register" />
    </Suspense>
  );
}
