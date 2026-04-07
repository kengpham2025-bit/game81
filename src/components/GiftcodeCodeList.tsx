'use client';

export default function GiftcodeCodeList({ codes }: { codes: string[] }) {
  if (codes.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-4">Mã giftcode được cập nhật liên tục. Quay lại sau để nhận mã mới.</p>
    );
  }
  return (
    <ul className="mt-6 space-y-2">
      {codes.map((code, i) => (
        <li
          key={`${code}-${i}`}
          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#333]"
        >
          <code className="text-green-400 font-mono text-sm break-all">{code}</code>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(code)}
            className="shrink-0 px-3 py-1 text-xs bg-[#e11d48] text-white rounded hover:opacity-90"
          >
            Copy
          </button>
        </li>
      ))}
    </ul>
  );
}
