const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character] ?? character);
}

export function sanitizeEmailText(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim();
}
