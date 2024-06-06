export interface SanitizeUrlOptions {
  allowedSchemes?: string[];
  permitInvalid?: boolean;
}

export const sanitizeUrl = (
  url: string | undefined,
  { allowedSchemes, permitInvalid = false }: SanitizeUrlOptions
): null | string => {
  if (!url) return null;

  let parsedUrl: URL | null = null;

  try {
    parsedUrl = new URL(url);
  } catch {
    return permitInvalid ? url : null;
  }

  if (
    allowedSchemes &&
    !allowedSchemes.includes(parsedUrl.protocol.slice(0, -1))
  ) {
    return null;
  }

  return parsedUrl.href;
};
