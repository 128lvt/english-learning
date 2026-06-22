# VocaNight — Học từ vựng tiếng Anh mỗi đêm 🌙

Ứng dụng flashcard học từ vựng tiếng Anh xây dựng bằng **Next.js 16 (App Router)**, **Postgres (Neon)** và **Auth.js v5** — dùng được trên mọi thiết bị (máy tính, điện thoại), mọi trình duyệt, deploy thẳng lên Vercel.

---

## 1. Tính năng

### Xác thực (mới)
- **Đăng ký / Đăng nhập** bằng Email + Mật khẩu (mật khẩu được hash bằng bcrypt, salt rounds = 12)
- **Đăng nhập Google OAuth** (tuỳ chọn — hoạt động nếu cấu hình `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`)
- **Middleware bảo vệ** toàn bộ app — tự redirect về `/login` nếu chưa đăng nhập
- **Dữ liệu riêng tư theo từng tài khoản** — mỗi user có bộ từ vựng riêng, không bị lẫn nhau
- **UserMenu** (dropdown góc trên phải): hiển thị tên, email, streak ngày học, nút đăng xuất
- **Bộ từ mẫu** được tự động seed cho tài khoản mới ngay khi đăng ký

### Học từ vựng
- **Flashcard lật thẻ** — mặt trước (từ vựng + từ loại), mặt sau (phiên âm + nghĩa + ví dụ)
- **Shuffle mode** — nút xáo trộn ngẫu nhiên thứ tự thẻ trong phiên học
- **Session counter** — đếm số thẻ đã xem trong phiên học hiện tại
- **Phím tắt**: `←`/`→` chuyển thẻ · `Space`/`Enter` lật thẻ · `1` = Chưa nhớ · `2` = Đã thuộc
- **Đang học / Đã học** với nút chuyển đổi qua lại
- **Xoá từ** (với optimistic update + rollback nếu API lỗi)
- **Sửa từ** — modal slide-up với đầy đủ trường, chip chọn từ loại
- **Thêm từ mới** ngay trong lúc học

### Import / Export
- **Import Excel** (.xlsx/.xls) — parse ở trình duyệt, gửi lên server lưu vào DB
- **Xuất Excel** — tải toàn bộ danh sách từ ra file `.xlsx` (có cột Trạng thái để round-trip)
- Hỗ trợ cột: STT, Từ vựng, Từ loại, Phiên âm, Ý nghĩa, Ví dụ minh họa, Trạng thái (tuỳ chọn)

### Thống kê & Streak
- **4 thẻ thống kê**: Tổng từ, Đang học, Đã học, Phiên này
- **Progress bar** tiến độ học tổng thể
- **Study streak** — đếm chuỗi ngày học liên tiếp (hiển thị trong UserMenu)
- **Tìm kiếm** từ vựng / nghĩa trong cả hai danh sách

---

## 2. Công nghệ

| Thành phần | Chi tiết |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Auth.js v5 (next-auth@beta) — Credentials + Google OAuth |
| Database | Postgres (Neon) qua `@neondatabase/serverless` |
| Styling | TailwindCSS 4 (CSS-first `@theme`) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Excel | SheetJS (xlsx) — parse ở client, build workbook ở server |
| Deploy | Vercel (zero-config) |

---

## 3. Cấu trúc dự án

```
vocanight-next/
├─ app/
│  ├─ layout.tsx                  # Root layout: fonts (Lora/Jakarta/JetBrains), metadata, providers
│  ├─ page.tsx                    # Render <App /> client component
│  ├─ globals.css                 # Tailwind v4 @theme: màu ink/paper/amber/sage/clay, font tokens
│  ├─ login/page.tsx              # Trang đăng nhập
│  ├─ register/page.tsx           # Trang đăng ký
│  └─ api/
│     ├─ auth/[...nextauth]/      # NextAuth route handler
│     ├─ register/                # POST — tạo tài khoản mới
│     ├─ streak/                  # POST — cập nhật study streak
│     └─ words/
│        ├─ route.ts              # GET (list), POST (thêm 1 từ)
│        ├─ [id]/route.ts         # PATCH (sửa / đổi status), DELETE
│        ├─ import/route.ts       # POST (bulk insert từ Excel)
│        └─ export/route.ts       # GET (tải .xlsx)
├─ components/
│  ├─ Auth/
│  │  ├─ AuthForm.tsx             # Form đăng nhập/đăng ký (dùng chung cho cả 2 trang)
│  │  └─ UserMenu.tsx             # Dropdown avatar: tên, streak, đăng xuất
│  ├─ Flashcard/
│  │  ├─ Flashcard.tsx            # Thẻ lật AnimatePresence (không dùng backface-visibility trick)
│  │  └─ FlashcardView.tsx        # Điều hướng thẻ + nút Shuffle + session counter
│  ├─ Layout/
│  │  ├─ AppShell.tsx             # Wrapper: TopNav + BottomNav + main content
│  │  ├─ TopNav.tsx               # Desktop nav bar với UserMenu
│  │  ├─ BottomNav.tsx            # Mobile tab bar
│  │  ├─ SyncIndicator.tsx        # Badge đồng bộ cloud nhỏ
│  │  └─ navConfig.ts             # Cấu hình 5 tab menu
│  ├─ Learning/LearningPage.tsx   # Deck lật thẻ + danh sách + Sửa/Xoá
│  ├─ Learned/LearnedPage.tsx     # Danh sách đã học + Học lại / Sửa / Xoá
│  ├─ AddWord/AddWordPage.tsx     # Form thêm từ mới
│  ├─ Import/ImportPage.tsx       # Drop zone import + nút xuất Excel
│  ├─ Stats/StatsPage.tsx         # 4 thẻ số liệu + progress bar + streak info
│  ├─ common/
│  │  ├─ EditWordModal.tsx        # Modal slide-up sửa từ (dùng ở Learning + Learned)
│  │  ├─ ToastStack.tsx           # Stack thông báo toast (success/error/info)
│  │  ├─ SearchBar.tsx            # Input tìm kiếm có nút xoá
│  │  ├─ ProgressBar.tsx          # Progress bar gradient amber
│  │  └─ EmptyState.tsx           # Placeholder khi danh sách trống
│  ├─ App.tsx                     # Root client component: routing giữa 5 trang, loading/error states
│  └─ SessionWrapper.tsx          # Bọc SessionProvider (cho useSession() hoạt động)
├─ context/
│  ├─ VocabContext.tsx            # Provider: fetch API, optimistic updates, shuffle, session counter
│  ├─ useVocab.ts                 # Hook useVocab()
│  └─ vocabContextDefinition.ts  # Interface VocabContextValue
├─ lib/
│  ├─ db.ts                       # Neon SQL client (lazy-init), ensureSchema()
│  ├─ users-repo.ts               # CRUD users: findByEmail, createWithCredentials, streak, OAuth
│  ├─ words-repo.ts               # CRUD words (scoped by userId): list, create, update, delete, bulk
│  ├─ excel.ts                    # parseExcelFile() (client) + buildWorkbookBytes() (server)
│  └─ sampleData.ts               # 12 từ mẫu seed cho tài khoản mới
├─ types/index.ts                 # VocabWord, NewWordInput, ViewKey, ... + Session augment
├─ auth.ts                        # Auth.js config: Credentials + Google, JWT callbacks
├─ middleware.ts                  # Bảo vệ routes, redirect /login nếu chưa đăng nhập
├─ .env.example                   # Mẫu cấu hình env vars
└─ sample-data/vocabulary_mau.xlsx
```

---

## 4. Cài đặt và chạy ở máy local

**Yêu cầu**: Node.js 18+

```bash
cd vocanight-next
npm install
```

Tạo `.env.local` (copy từ `.env.example`):

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
AUTH_SECRET=your-very-strong-random-secret-here

# Tuỳ chọn — bỏ trống nếu chỉ dùng đăng nhập email/mật khẩu
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Chạy:

```bash
npm run dev      # http://localhost:3000
npm run build    # Build production
npm run lint     # ESLint
```

**Lần đầu mở app**: `ensureSchema()` tự tạo bảng `users` và `words` trong database — không cần chạy SQL tay.

---

## 5. Deploy lên Vercel

### Bước 1 — Push code lên GitHub

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/your-name/vocanight-next.git
git push -u origin main
```

### Bước 2 — Import vào Vercel

Vào [vercel.com/new](https://vercel.com/new) → Import repo → Deploy (Next.js được nhận diện tự động).

### Bước 3 — Gắn database Neon

**Project → Storage → Browse Marketplace → Neon** → Create & Connect. Vercel tự inject `DATABASE_URL` vào project.

### Bước 4 — Thêm biến môi trường

**Project → Settings → Environment Variables**, thêm:

| Tên | Giá trị |
|---|---|
| `AUTH_SECRET` | Chuỗi ngẫu nhiên: `openssl rand -base64 33` |
| `AUTH_GOOGLE_ID` | *(tuỳ chọn)* Client ID từ Google Console |
| `AUTH_GOOGLE_SECRET` | *(tuỳ chọn)* Client Secret từ Google Console |

### Bước 5 — Redeploy

**Deployments → Redeploy** để áp dụng env vars mới.

### Cấu hình Google OAuth *(tuỳ chọn)*

1. Vào [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
4. Copy Client ID và Secret vào env vars Vercel

---

## 6. Schema database

App tự tạo 2 bảng khi khởi động lần đầu:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT,              -- NULL với OAuth users
  provider TEXT NOT NULL DEFAULT 'credentials',
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE words (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stt INTEGER NOT NULL,
  word TEXT NOT NULL,
  part_of_speech TEXT NOT NULL DEFAULT 'unknown',
  phonetic TEXT NOT NULL DEFAULT '',
  meaning TEXT NOT NULL DEFAULT '',
  example TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'learning',  -- 'learning' | 'learned'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 7. API Routes

| Route | Method | Auth | Mô tả |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handler |
| `/api/register` | POST | — | Đăng ký tài khoản mới |
| `/api/streak` | POST | ✓ | Cập nhật study streak |
| `/api/words` | GET | ✓ | Lấy danh sách từ của user |
| `/api/words` | POST | ✓ | Thêm 1 từ mới |
| `/api/words/:id` | PATCH | ✓ | Sửa từ hoặc đổi trạng thái |
| `/api/words/:id` | DELETE | ✓ | Xoá từ |
| `/api/words/import` | POST | ✓ | Bulk insert từ Excel đã parse |
| `/api/words/export` | GET | ✓ | Tải file .xlsx |

---

## 8. Ghi chú kỹ thuật

- **Auth middleware** chạy ở Edge runtime — `auth.ts` dùng dynamic `import()` cho bcrypt/DB để tránh kéo Node-only modules vào Edge bundle.
- **Optimistic updates**: đánh dấu Đã thuộc / Học lại / Xoá từ phản hồi ngay lập tức, rollback nếu API lỗi.
- **Shuffle mode**: khi bật, tạo và cache thứ tự ngẫu nhiên; từ mới thêm sau được nối vào cuối (không re-shuffle toàn bộ).
- **Bảo mật**: mọi API route (trừ `/api/auth` và `/api/register`) đều kiểm tra session và lọc dữ liệu theo `user_id` — không thể truy cập từ của người dùng khác dù biết ID.
