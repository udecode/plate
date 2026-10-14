const HTML_VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const HTML_BOOLEAN_ATTRIBUTES = new Map([
  ['checked', 'checked'],
  ['disabled', 'disabled'],
  ['readonly', 'readOnly'],
  ['required', 'required'],
  ['multiple', 'multiple'],
  ['hidden', 'hidden'],
]);

const BOOL_ATTR_REGEXES = Array.from(HTML_BOOLEAN_ATTRIBUTES.entries()).map(
  ([htmlAttr, jsxAttr]) => ({
    jsxAttr,
    reg: new RegExp(`(\\s|^)${htmlAttr}(\\s|/?>|$)`, 'gi'),
  })
);

const ATTR_RENAMES: [RegExp, string][] = [
  [/(\s)class=/g, '$1className='],
  [/(\s)for=/g, '$1htmlFor='],
];

export const legacyHtmlToJsx = (
  html: string,
  preserve?: (match: string) => boolean
): string => {
  if (!html || typeof html !== 'string') return html;

  return html
    .replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')
    .replace(
      /<([a-zA-Z0-9]+)\b([^>]*?)(\/?)>/gi,
      (_match, tagName, attrs, selfClosing) => {
        if (preserve?.(_match)) return _match;
        let a = attrs;

        ATTR_RENAMES.forEach(([pattern, replacement]) => {
          a = a.replace(pattern, replacement);
        });

        a = a.replace(
          /(^|\s)([a-zA-Z0-9_-]+)=([^{ \t\n\r"'>]+?)(?=\s|\/?>|$)/g,
          '$1$2="$3"'
        );

        for (const { reg, jsxAttr } of BOOL_ATTR_REGEXES) {
          a = a.replace(reg, `$1${jsxAttr}="true"$2`);
        }

        const isVoid = HTML_VOID_ELEMENTS.has(tagName.toLowerCase());
        const closing = isVoid ? ' /' : selfClosing;

        return `<${tagName}${a.trimEnd()}${closing}>`;
      }
    );
};
