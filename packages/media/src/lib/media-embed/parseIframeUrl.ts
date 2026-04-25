const regexMatchIframeSrc = /<iframe\b[^>]*\bsrc="([^"]*)"/i;
const regexGroupQuotes = /"([^"]*)"/;
const regexTwitterStatusUrl =
  /https?:\/\/(?:twitter|x)\.com\/(?:#!\/)?\w+\/status(?:es)?\/\d+/;

export const parseIframeUrl = (url: string) => {
  // if not starting with http, assume pasting of full iframe embed code
  if (!url.startsWith('http')) {
    const twitterStatusUrl = url.match(regexTwitterStatusUrl)?.[0];

    if (twitterStatusUrl) {
      return twitterStatusUrl;
    }

    const src = regexMatchIframeSrc.exec(url)?.[0];
    const returnString = src?.match(regexGroupQuotes)?.[1];

    if (returnString) {
      return returnString;
    }
  }

  return url;
};
