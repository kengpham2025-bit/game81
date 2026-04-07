import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconSearch({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconChevronDown({ className = 'w-3 h-3', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconArrowLeft({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function IconGift({ className = 'w-6 h-6', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

export function IconMegaphone({ className = 'w-6 h-6', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="m3 11 18-5v12L3 13v-2zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

export function IconPencil({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function IconTrash({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconClipboard({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6" />
    </svg>
  );
}

export function IconArticle({ className = 'w-8 h-8', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  );
}

export function IconFolder({ className = 'w-8 h-8', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.16 3.9A2 2 0 0 0 7.47 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

export function IconGamepad({ className = 'w-8 h-8', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 12h4M8 10v4" />
      <circle cx="17" cy="10" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="19" cy="14" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSettings({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEye({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconChart({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

export function IconLink({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function IconBolt({ className = 'w-6 h-6', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function IconGlobe({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
    </svg>
  );
}

export function IconFileText({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  );
}

export function IconRobot({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="5" y="8" width="14" height="12" rx="2" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2M12 15v.01M9 12h.01M15 12h.01" />
      <path d="M12 18v2M8 20h8" />
    </svg>
  );
}

export function IconSmartphone({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export function IconCheck({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconX({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconPlus({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}

export function IconCalendar({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function IconSave({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function IconArrowUp({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function IconLayoutPanel({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect width="7" height="18" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
    </svg>
  );
}

export function IconBlocks({ className = 'w-4 h-4', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

export function IconBraces({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M8 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h1M16 3h1a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-1" />
    </svg>
  );
}

export function IconUser({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconKey({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export function IconMail({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function IconMenu({ className = 'w-6 h-6', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...stroke} {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconBrandFacebook({ className = 'w-5 h-5', ...p }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...p}>
      <path fill="currentColor" d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
    </svg>
  );
}
