const parseHtmlWith = (Parser: typeof DOMParser, source: string) =>
  new Parser().parseFromString(source, 'text/html');

const parseXmlWith = (
  Parser: typeof DOMParser,
  source: string,
  onMalformed = () => new Error('DOCX package contains malformed XML.')
) => {
  const document = new Parser().parseFromString(source, 'application/xml');

  if (document.querySelector('parsererror')) throw onMalformed();

  return document;
};

export const parseDocxHtml = (source: string) =>
  parseHtmlWith(DOMParser, source);

export const parseDocxXml = (source: string, onMalformed?: () => Error) =>
  parseXmlWith(DOMParser, source, onMalformed);

/**
 * DOCX import captures these at entry so a later change to the global
 * `DOMParser` never reaches its conversion.
 */
export const captureDocxDomParsers = () => {
  const Parser = globalThis.DOMParser;

  if (!Parser) return null;

  return Object.freeze({
    parseHtml: (source: string) => parseHtmlWith(Parser, source),
    parseXml: (source: string, onMalformed?: () => Error) =>
      parseXmlWith(Parser, source, onMalformed),
  });
};
