import { BarChart3, BookOpen, CheckCircle, PlusCircle, Upload } from 'lucide-react';
import type { ViewKey } from '@/types';

export interface NavItemConfig {
  key: ViewKey;
  label: string;
  shortLabel: string;
  icon: typeof BookOpen;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { key: 'learning', label: 'Đang học', shortLabel: 'Đang học', icon: BookOpen },
  { key: 'learned', label: 'Đã học', shortLabel: 'Đã học', icon: CheckCircle },
  { key: 'add', label: 'Thêm từ mới', shortLabel: 'Thêm', icon: PlusCircle },
  { key: 'import', label: 'Import Excel', shortLabel: 'Import', icon: Upload },
  { key: 'stats', label: 'Thống kê', shortLabel: 'Thống kê', icon: BarChart3 },
];
