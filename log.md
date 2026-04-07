# Log thay đổi dự án

## 2025-03-19 — Phân tích lỗi build Cloudflare Pages & hướng xử lý

### Tình trạng
- Build trên Cloudflare Pages đang **fail**.
- Repo: `kengpham2025-bit/game81`, branch production: `main`.
- Cấu hình hiện tại trên Cloudflare:
  - Build command: `npm run build`
  - Deploy command: `npx wrangler deploy`
  - Version command: `npx wrangler versions upload`
  - Root directory: `/`
  - Variables and secrets: **None**

### Nguyên nhân chính

1. **Project được cấu hình cho Vercel, không cho Cloudflare**
   - Có `vercel.json`, script `deploy` trong `package.json` là `vercel --prod`.
   - **Không có** file `wrangler.toml` hoặc cấu hình Wrangler → lệnh `npx wrangler deploy` sẽ lỗi.

2. **Next.js trên Cloudflare Pages cần bộ adapter riêng**
   - Build chuẩn `next build` tạo output cho Node/Vercel.
   - Cloudflare Pages cần build qua `@cloudflare/next-on-pages` (hoặc OpenNext) và deploy bằng `wrangler pages deploy` (output đặc thù), không phải chỉ `wrangler deploy`.

3. **Biến môi trường**
   - Ở Cloudflare, mục "Variables and secrets" đang **None**.
   - Ứng dụng dùng Prisma + CockroachDB (`DATABASE_URL`), Next-Auth, Google Analytics, Groq/Gemini API. Thiếu env khi build/runtime có thể gây lỗi hoặc lỗi kết nối DB.

### Hướng xử lý (chọn một)

#### Cách 1 — Deploy lên Vercel (khuyến nghị, ít sửa code)
- Project đã có `vercel.json` và script deploy cho Vercel.
- Trên Vercel: kết nối repo GitHub, thêm Environment Variables (ít nhất `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, các key API cần dùng).
- Deploy bằng: `npm run deploy` hoặc push lên branch đã kết nối.

#### Cách 2 — Giữ Cloudflare Pages (cần chỉnh project)
- Thêm package: `@cloudflare/next-on-pages`.
- Tạo `wrangler.toml` với `pages_build_output_dir` trỏ đúng thư mục output của adapter.
- Đổi build script: dùng build qua adapter (ví dụ `npx @cloudflare/next-on-pages`) thay vì chỉ `next build`.
- Trên Cloudflare Dashboard: đổi Deploy command thành `npx wrangler pages deploy` (và bỏ Version command nếu không dùng).
- Thêm Variables and secrets: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, và các biến khác giống `.env.example`.
- Một số route/API có thể cần `runtime = 'edge'` tùy giới hạn của Cloudflare.

### Ghi chú
- Chưa thay đổi file code trong lần này; chỉ phân tích và ghi log.
- Khi chọn Cách 2, có thể bổ sung các bước cụ thể (ví dụ nội dung `wrangler.toml`, script trong `package.json`) trong log sau.

---

## 2026-03-19 — Đã chỉnh OpenNext Cloudflare (Workers) & cấu hình Dashboard

### Điều chỉnh trong repo
- **`wrangler.jsonc`**: chuyển sang định dạng **Cloudflare Workers** theo [OpenNext Cloudflare](https://opennext.js.org/cloudflare/get-started): `main` → `.open-next/worker.js`, `assets` → `.open-next/assets`, `services` (WORKER_SELF_REFERENCE), cờ `nodejs_compat` + `global_fetch_strictly_public`. **Bỏ** `pages_build_output_dir` (chỉ dùng khi deploy kiểu Pages thuần).
- **`public/_headers`**: thêm cache tĩnh `/_next/static/*` (khuyến nghị của OpenNext).
- **`next.config.ts`**: gọi `initOpenNextCloudflareForDev()` từ `@opennextjs/cloudflare`.
- **`package.json`**: `build:cloudflare` gọn; `deploy` / `deploy:cloudflare` / `preview` dùng CLI `opennextjs-cloudflare` (không dùng `wrangler pages deploy`).

### Cấu hình cần sửa trên Cloudflare (Build settings)
Theo tài liệu OpenNext: **không dùng `wrangler` deploy Pages trực tiếp**; lệnh deploy chuẩn là `opennextjs-cloudflare deploy` (bên trong gọi `wrangler deploy` cho Worker).

| Mục | Giá trị đề xuất |
|-----|-----------------|
| **Build command** | `npm run build:cloudflare` |
| **Deploy command** | `npx opennextjs-cloudflare deploy` |
| **Version command** | **Để trống** (xóa `npx wrangler versions upload` — chỉ dùng khi bạn chủ động làm gradual deployment / upload version) |
| **Root directory** | `/` |

### Biến môi trường (bắt buộc bổ sung)
Trước đây **Variables and secrets: None** → production sẽ lỗi DB/API. Thêm tối thiểu (theo `.env.example` + URL site):

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL` (domain Cloudflare của bạn, ví dụ `https://game81.pages.dev` hoặc custom domain `https://gameviet.io.vn`)
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` (nếu dùng GA)
- `GROQ_API_KEY` và/hoặc `GEMINI_API_KEY` (AI rewrite)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SEED_SECRET`
- SMTP (nếu dùng gửi mail): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### Lưu ý
- Nếu project Cloudflare đang là **Pages** thuần với `wrangler pages deploy`, hãy đổi sang lệnh deploy như bảng trên hoặc tạo **Worker** kết nối Git theo [Workers CI/CD](https://developers.cloudflare.com/workers/ci-cd/) — OpenNext bundle là **Worker + assets**, không phải output Pages kiểu cũ.
- Mục log cũ phía trên có đoạn gợi ý `wrangler pages deploy` cho `next-on-pages`; dự án hiện dùng **`@opennextjs/cloudflare`** nên bỏ qua, làm theo mục này.

---

## 2026-03-19 lần 2 — Fix WORKER_SELF_REFERENCE + push GitHub

### Đã sửa
- **`wrangler.jsonc`**: bỏ section `services` (WORKER_SELF_REFERENCE binding tham chiếu `gameviet` - không tồn tại), thêm `"main": ".open-next/worker.js"`, `"global_fetch_strictly_public"`, và cấu hình `assets`.
- Đã push commit `af38f10` lên GitHub.

### Lưu ý quan trọng
- Cloudflare Workers cần **Environment Variables** trên Dashboard, không dùng `.env.local`.
- Sau khi deploy thành công, vào **Settings → Variables and Secrets** thêm:
  - `DATABASE_URL` (CockroachDB connection string)
  - `NEXT_PUBLIC_SITE_URL` (domain Cloudflare, ví dụ `https://game81.pages.dev`)
  - Các key API khác nếu cần
