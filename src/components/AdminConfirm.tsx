'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from 'react';

export type AdminConfirmOptions = {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  /** danger = nút xác nhận đỏ (xóa, v.v.) */
  variant?: 'danger' | 'default';
};

type Pending = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'default';
  resolve: (ok: boolean) => void;
};

type Ctx = {
  confirm: (message: string, options?: AdminConfirmOptions) => Promise<boolean>;
};

const AdminConfirmContext = createContext<Ctx | null>(null);

export function useAdminConfirm() {
  const ctx = useContext(AdminConfirmContext);
  if (!ctx) {
    throw new Error('useAdminConfirm must be used within AdminConfirmProvider');
  }
  return ctx;
}

export function AdminConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback((message: string, options?: AdminConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({
        message,
        title: options?.title ?? 'Xác nhận',
        confirmText: options?.confirmText ?? 'Đồng ý',
        cancelText: options?.cancelText ?? 'Hủy',
        variant: options?.variant ?? 'default',
        resolve,
      });
    });
  }, []);

  const finish = (ok: boolean) => {
    if (pending) {
      pending.resolve(ok);
      setPending(null);
    }
  };

  return (
    <AdminConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="admin-confirm-title"
          aria-describedby="admin-confirm-desc"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#333] bg-[#141414] shadow-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-2">
              <h2 id="admin-confirm-title" className="text-lg font-bold text-white">
                {pending.title}
              </h2>
              <p id="admin-confirm-desc" className="mt-3 text-gray-300 text-[0.95rem] leading-relaxed whitespace-pre-wrap">
                {pending.message}
              </p>
            </div>
            <div className="flex gap-3 justify-end px-6 py-4 bg-[#0f0f0f] border-t border-[#2a2a2a]">
              <button
                type="button"
                onClick={() => finish(false)}
                className="px-4 py-2.5 rounded-lg text-gray-300 bg-[#2a2a2a] hover:bg-[#333] font-medium transition-colors"
              >
                {pending.cancelText}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className={`px-4 py-2.5 rounded-lg font-semibold text-white transition-colors ${
                  pending.variant === 'danger'
                    ? 'bg-[#e11d48] hover:bg-[#be123c]'
                    : 'bg-[#0ea5e9] hover:bg-[#0284c7]'
                }`}
              >
                {pending.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminConfirmContext.Provider>
  );
}
