const classAttrRegExp = / class="([^"]*)"/g;
const whitespaceRegExp = /\s+/;

/**
 * Remove all class names that do not start with one of preserveClassNames
 * (`plite-` by default)
 */
export const stripHtmlClassNames = (
  html: string,
  { preserveClassNames = ['plite-'] }: { preserveClassNames?: string[] }
) => {
  if (preserveClassNames.length === 0) {
    return html.replaceAll(classAttrRegExp, '');
  }

  const preserveRegExp = new RegExp(
    preserveClassNames.map((cn) => `^${cn}`).join('|')
  );

  return html.replaceAll(
    classAttrRegExp,
    (_match: string, className: string) => {
      const classesToKeep = className
        .split(whitespaceRegExp)
        .filter((cn) => preserveRegExp.test(cn));

      return classesToKeep.length === 0
        ? ''
        : ` class="${classesToKeep.join(' ')}"`;
    }
  );
};
