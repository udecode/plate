export const safeDecodeUrl = (url: string) => {
  try {
    return decodeURI(url);
  } catch (error) {
    if (error instanceof URIError) {
      return url;
    }

    throw error;
  }
};
