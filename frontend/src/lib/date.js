/**
 * Format a date string as a relative time string (e.g. "3 gün önce", "bugün").
 * No external dependencies — pure JS.
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffD === 0) {
    if (diffH < 1) return 'Az önce';
    if (diffH === 1) return '1 saat önce';
    return `${diffH} saat önce`;
  }
  if (diffD === 1) return 'Dün';
  if (diffD < 7) return `${diffD} gün önce`;
  if (diffD < 30) {
    const weeks = Math.floor(diffD / 7);
    return weeks === 1 ? '1 hafta önce' : `${weeks} hafta önce`;
  }
  if (diffD < 365) {
    const months = Math.floor(diffD / 30);
    return months === 1 ? '1 ay önce' : `${months} ay önce`;
  }
  return d.toLocaleDateString('tr-TR');
}
