/** URL iframe được phép hiển thị (YouTube, Vimeo, …). */
export function isAllowedVideoEmbedSrc(src: string): boolean {
  const s = (src || '').toLowerCase().trim();
  if (!s || s.startsWith('javascript:')) return false;
  return (
    s.includes('youtube.com/embed') ||
    s.includes('youtube-nocookie.com/embed') ||
    s.includes('youtu.be/') ||
    s.includes('player.vimeo.com') ||
    s.includes('dailymotion.com/embed') ||
    s.includes('facebook.com/plugins/video.php') ||
    s.includes('tiktok.com/embed') ||
    s.includes('streamable.com/e/') ||
    s.includes('kick.com/embed')
  );
}
