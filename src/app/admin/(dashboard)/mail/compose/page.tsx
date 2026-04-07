import { getSeoSettings } from '@/lib/seo';
import MailComposeClient from './MailComposeClient';

export default async function AdminMailComposePage() {
  const s = await getSeoSettings();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Tạo email</h1>
      <p className="text-gray-400 mb-6">
        Soạn nội dung và mở ứng dụng mail trên máy để gửi (Gmail, Outlook…). Mặc định gửi tới email spam đã cấu hình nếu có.
      </p>
      <MailComposeClient defaultTo={s.spamEmail || s.supportEmail || ''} />
    </div>
  );
}
