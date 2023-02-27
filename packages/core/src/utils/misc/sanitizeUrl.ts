export interface SanitizeUrlOptions {
  allowedSchemes?: string[];
}

export const sanitizeUrl = (
  url: string,
  { allowedSchemes }: SanitizeUrlOptions
): string | null => {
  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return null;
  }

  if (
    allowedSchemes &&
    !allowedSchemes.includes(parsedUrl.protocol.slice(0, -1))
  ) {
    return null;
  }

  return url;
};
