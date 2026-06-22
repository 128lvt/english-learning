# VocaNight (Next.js) — Học từ vựng tiếng Anh mỗi đêm 🌙

Bản **Next.js (App Router)** của VocaNight — flashcard học từ vựng tiếng Anh, dữ liệu lưu trên **Postgres (Neon)**
qua API routes, nên **dùng được trên mọi thiết bị** (máy tính, điện thoại, mọi trình duyệt) và **deploy thẳng lên
Vercel**.

> Đây là bản kế tiếp của bản Vite/React trước đó — bản đó dùng File System Access API để ghi trực tiếp vào file
> Excel, chỉ chạy trên Chrome/Edge desktop. Bản Next.js này thay file Excel bằng một database thật trên cloud,
> nên hoạt động được trên mobile và đồng bộ giữa nhiều thiết bị.

## 1. Tính năng chính

- Flashcard lật thẻ, phím tắt (←/→ chuyển thẻ, Space lật thẻ, 1/2 đánh dấu).
- Đang học / Đã học, thêm từ mới ngay trong lúc học.
- Import Excel (.xlsx/.xls) — parse ngay trên trình duyệt, gửi lên server để lưu vào database.
- Xuất Excel — tải toàn bộ database hiện tại ra một file `.xlsx` mới.
- Tìm kiếm trong Đang học / Đã học, trang Thống kê có progress bar.
- **Dữ liệu lưu trên Postgres (Neon)**, qua các API route của Next.js — không còn phụ thuộc trình duyệt hay
  thiết bị nào, dùng được trên mobile.
- Giao diện tối, responsive mobile-first.

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | TailwindCSS 4 (CSS-first config qua `@theme`) |
| Animation | Framer Motion |
| Icon | Lucide React |
| Database | Postgres qua [Neon](https://neon.tech) (Vercel Marketplace) |
| DB client | `@neondatabase/serverless` (HTTP, không cần connection pool) |
| Excel | `xlsx` (SheetJS) — parse ở client, build workbook ở server |
| Deploy | Vercel |

## 3. Cấu trúc dự án

```
vocanight-next/
├─ app/
│  ├─ layout.tsx              # Root layout: fonts, metadata, bọc VocabProvider
│  ├─ page.tsx                # Render <App /> (client component)
│  ├─ globals.css             # Tailwind v4 theme (@theme): màu/font/shadow
│  └─ api/words/
│     ├─ route.ts             # GET (list), POST (thêm 1 từ)
│     ├─ [id]/route.ts        # PATCH (đổi trạng thái learning/learned)
│     ├─ import/route.ts      # POST (bulk insert từ Excel đã parse)
│     └─ export/route.ts      # GET (tải toàn bộ DB ra .xlsx)
├─ components/                # Toàn bộ UI (Flashcard, Learning, Learned, AddWord, Import, Stats, Layout, common)
├─ context/                   # VocabContext + useVocab — fetch & cập nhật qua API, không còn localStorage
├─ lib/
│  ├─ db.ts                   # Kết nối Neon (lazy — không throw lúc build), ensureSchema() tự tạo bảng + seed
│  ├─ words-repo.ts           # Các hàm CRUD (listWords, createWord, updateWordStatus, bulkInsertWords)
│  ├─ excel.ts                # Parse Excel (client) + build workbook bytes (server, dùng cho export)
│  └─ sampleData.ts           # Bộ từ mẫu để seed database lần đầu
├─ types/index.ts
├─ .env.example                # Mẫu biến môi trường cần thiết
└─ package.json
```

## 4. Chạy ở máy local

Yêu cầu: [Node.js](https://nodejs.org) 18+, và một Postgres database (xem mục 5).

```bash
cd vocanight-next
npm install
```

Tạo file `.env.local` (copy từ `.env.example`) với connection string Postgres của bạn:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Rồi chạy:

```bash
npm run dev
```

Mở `http://localhost:3000`.

### Build / kiểm tra

```bash
npm run build   # build production (Turbopack)
npm run start   # chạy bản build
npm run lint     # ESLint
```

## 5. Lấy database Postgres miễn phí (Neon) và deploy lên Vercel

Vercel đã chuyển Postgres sang mô hình **Marketplace integration**, dùng [Neon](https://neon.tech) làm nhà cung
cấp. Cách nhanh nhất — làm ngay trong lúc deploy:

1. Push code lên một repo GitHub (hoặc dùng `vercel` CLI để deploy trực tiếp từ máy).
2. Vào [vercel.com/new](https://vercel.com/new) → Import repo này → Deploy (Next.js được Vercel tự nhận diện,
   không cần cấu hình gì thêm).
3. Sau khi deploy lần đầu (sẽ lỗi vì chưa có `DATABASE_URL`, không sao): vào **Project → Storage tab → Connect
   Database / Browse Marketplace → chọn Neon (Postgres) → Create**. Vercel sẽ tự inject biến `DATABASE_URL` (hoặc
   tương đương) vào project.
4. Vào **Deployments**, chọn deployment mới nhất → **Redeploy** (để áp dụng biến môi trường mới).
5. Mở app — lần đầu vào, `ensureSchema()` sẽ tự tạo bảng `words` và nạp sẵn bộ từ mẫu, không cần chạy migration
   tay.

**Chạy local nhưng dùng chung database với production:** sau khi đã liên kết project với Vercel (`vercel link`),
chạy `vercel env pull .env.local` để tải đúng connection string đó về máy — không cần cài Postgres riêng ở local.

## 6. Cấu trúc bảng `words`

App tự tạo bảng này (không cần chạy SQL tay):

```sql
CREATE TABLE words (
  id TEXT PRIMARY KEY,
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

## 7. API routes

| Route | Method | Mô tả |
|---|---|---|
| `/api/words` | GET | Lấy toàn bộ danh sách từ |
| `/api/words` | POST | Thêm 1 từ mới — body: `{ word, partOfSpeech, phonetic, meaning, example }` |
| `/api/words/:id` | PATCH | Đổi trạng thái — body: `{ status: "learning" \| "learned" }` |
| `/api/words/import` | POST | Thêm nhiều từ cùng lúc — body: `{ rows: ImportRow[] }` |
| `/api/words/export` | GET | Tải file `.xlsx` chứa toàn bộ dữ liệu hiện tại |

## 8. Lưu ý khi đã build/test trong môi trường này

Project đã được chạy qua `tsc --noEmit`, `eslint` và `next build` — tất cả đều sạch. Phần gọi Postgres (qua
`@neondatabase/serverless`) đã được review kỹ về mặt logic SQL nhưng **chưa được test trực tiếp với một Postgres
thật** trong môi trường này (môi trường chạy việc này bị giới hạn mạng, không gọi ra ngoài Internet được). Sau khi
gắn `DATABASE_URL` thật (mục 5), hãy thử qua một lượt: thêm từ → đánh dấu đã thuộc → học lại → import Excel → tải
Excel, để chắc chắn mọi thứ hoạt động đúng với database của bạn.

## 9. Gợi ý mở rộng

- Thêm xác thực người dùng (NextAuth/Clerk) nếu muốn nhiều người dùng có danh sách từ riêng (thêm cột `user_id`).
- Thêm chế độ ôn tập ngẫu nhiên (xáo trộn thứ tự thẻ).
- Cache `GET /api/words` bằng React Query/SWR nếu danh sách từ lớn.
- Thêm phát âm Text-to-Speech ở mặt sau thẻ.
