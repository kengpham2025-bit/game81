/**
 * Layout gốc admin: không kiểm tra đăng nhập ở đây.
 * /admin/login phải mở được — tránh vòng lặp redirect.
 * Phần dashboard dùng layout trong (dashboard).
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
