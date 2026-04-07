import MailInboxClient from './MailInboxClient';

export default function AdminMailInboxPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Hộp thư / Spam</h1>
      <p className="text-gray-400 mb-6 max-w-3xl leading-relaxed">
        Tin nhắn khách gửi từ trang <strong className="text-gray-300">Liên hệ</strong> (/lien-he) và nút chat trên cạnh phải màn hình.
        Cấu hình email spam trong SEO chỉ để bạn biết địa chỉ nhận thư thật qua client mail — tin trên web luôn lưu tại đây.
      </p>
      <MailInboxClient />
    </div>
  );
}
