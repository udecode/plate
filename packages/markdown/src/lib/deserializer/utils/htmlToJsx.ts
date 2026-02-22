const VOID_ELEMENTS = new Set([
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

const BOOL_ATTRS = [
  'checked',
  'disabled',
  'readonly',
  'required',
  'multiple',
  'hidden',
];

export const htmlToJsx = (html: string): string => {
  if (!html || typeof html !== 'string') return html;

  let result = html.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  const tagRegex = /<([a-zA-Z0-9]+)\b([^>]*?)(\/?)>/gi;
  result = result.replace(tagRegex, (_match, tagName, attrs, selfClosing) => {
    let newAttrs = attrs;

    newAttrs = newAttrs.replace(/\bclass=(['"])/g, 'className=$1');

    newAttrs = newAttrs.replace(
      /(\s)([a-zA-Z0-9_-]+)=([^{ \t\n\r"'>]+?)(?=\s|\/?>|$)/g,
      '$1$2="$3"'
    );

    BOOL_ATTRS.forEach((attr) => {
      const reg = new RegExp(`(\\s|^)${attr}(\\s|/?>|$)`, 'gi');
      newAttrs = newAttrs.replace(reg, `$1${attr}="true"$2`);
    });

    const isVoid = VOID_ELEMENTS.has(tagName.toLowerCase());
    const needsClosing = isVoid && !selfClosing;

    return `<${tagName}${newAttrs}${needsClosing ? ' /' : selfClosing}>`;
  });

  return result;
};
