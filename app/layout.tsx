import type { Metadata, Viewport } from 'next';
import { Lora, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { VocabProvider } from '@/context/VocabContext';

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display-src',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans-src',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500'],
  variable: '--font-mono-src',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VocaNight — Học từ vựng mỗi đêm',
  description: 'Flashcard học từ vựng tiếng Anh, lưu trực tiếp vào database trên cloud — học mọi lúc, trên mọi thiết bị.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#14110F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${lora.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body>
        <VocabProvider>{children}</VocabProvider>
      </body>
    </html>
  );
}
