'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LogIn, Moon, UserPlus } from 'lucide-react';

type Mode = 'login' | 'register';

interface AuthFormProps {
  initialMode?: Mode;
}

export function AuthForm({ initialMode = 'login' }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const hasGoogle = !!(process.env.NEXT_PUBLIC_HAS_GOOGLE === '1');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? 'Đăng ký thất bại.');
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mode === 'login' ? 'Email hoặc mật khẩu không đúng.' : 'Đăng nhập sau khi đăng ký thất bại.');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogle() {
    setIsGoogleLoading(true);
    await signIn('google', { callbackUrl });
  }

  const inputClass =
    'w-full rounded-xl border border-ink-600 bg-ink-800 px-4 py-3 font-sans text-sm text-paper-100 placeholder:text-paper-400/60 outline-none transition-colors focus:border-amber/60 focus:ring-2 focus:ring-amber/20';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 px-5 py-10">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber/15 shadow-glow">
          <Moon className="h-7 w-7 text-amber-light" />
        </div>
        <h1 className="font-display text-2xl text-paper-100">VocaNight</h1>
        <p className="font-sans text-sm text-paper-400">Học từ vựng mỗi đêm</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-full border border-ink-700 bg-ink-800 p-1">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 rounded-full py-2 font-sans text-sm font-semibold transition-colors ${
                mode === m ? 'bg-amber text-ink-950 shadow-glow' : 'text-paper-400 hover:text-paper-100'
              }`}
            >
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-sm font-medium text-paper-200">Tên hiển thị</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ví dụ: Minh Anh"
                  className={inputClass}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-sm font-medium text-paper-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={inputClass}
                autoComplete={mode === 'login' ? 'username' : 'email'}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-sm font-medium text-paper-200">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Ít nhất 6 ký tự' : '••••••••'}
                  className={`${inputClass} pr-11`}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-paper-400 hover:text-paper-100"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-clay/30 bg-clay/10 px-4 py-2.5 font-sans text-sm text-clay-light">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex items-center justify-center gap-2 rounded-full bg-amber py-3 font-sans text-sm font-semibold text-ink-950 shadow-glow transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'login' ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isLoading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </motion.form>
        </AnimatePresence>

        {hasGoogle && (
          <>
            <div className="my-5 flex items-center gap-3 text-paper-400">
              <div className="h-px flex-1 bg-ink-700" />
              <span className="font-sans text-xs">hoặc</span>
              <div className="h-px flex-1 bg-ink-700" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={isGoogleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink-600 bg-ink-800 py-3 font-sans text-sm font-semibold text-paper-200 transition-colors hover:border-paper-400/40 hover:text-paper-100 disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Tiếp tục với Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
