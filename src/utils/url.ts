export const extractHostname = (url: string): string | null => {
  try {
    const u = new URL(url.includes('://') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};
