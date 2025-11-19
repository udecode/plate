const regexMatchSrc = /src=".*?"/;
const regexGroupQuotes = /"([^"]*)"/;

export const parseIframeUrl = (url: string) => {
  // if not starting with http, assume pasting of full iframe embed code
  if (!url.startsWith('http')) {
    const src = regexMatchSrc.exec(url)?.[0];
    const returnString = src?.match(regexGroupQuotes)?.[1];

    if (returnString) {
      return returnString;
    }
  }

  return url;
};
