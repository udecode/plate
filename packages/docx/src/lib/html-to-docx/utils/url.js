const isValidUrl = (urlString) => {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }

  // Check for http/https URLs
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// eslint-disable-next-line import/prefer-default-export
export { isValidUrl };
