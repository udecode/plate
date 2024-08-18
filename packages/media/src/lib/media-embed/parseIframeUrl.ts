export const parseIframeUrl = (url: string) => {
  // if not starting with http, assume pasting of full iframe embed code
  if (!url.startsWith('http')) {
    const regexMatchSrc = /src=".*?"/;
    const regexGroupQuotes = /"([^"]*)"/;

    const src = url.match(regexMatchSrc)?.[0];
    const returnString = src?.match(regexGroupQuotes)?.[1];

    if (returnString) {
      url = returnString;
    }
  }

  return url;
};
