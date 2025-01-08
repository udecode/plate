const classAttrRegExp = / class="([^"]*)"/g;

/**
 * Remove all class names that do not start with one of preserveClassNames
 * (`slate-` by default)
 */
export const stripHtmlClassNames = (
  html: string,
  { preserveClassNames = ['slate-'] }: { preserveClassNames?: string[] }
) => {
  if (preserveClassNames.length === 0) {
    return html.replaceAll(classAttrRegExp, '');
  }

  const preserveRegExp = new RegExp(
    preserveClassNames.map((cn) => `^${cn}`).join('|')
  );

  return html.replaceAll(
    classAttrRegExp,
    (match: string, className: string) => {
      const classesToKeep = className
        .split(/\s+/)
        .filter((cn) => preserveRegExp.test(cn));

      return classesToKeep.length === 0
        ? ''
        : ` class="${classesToKeep.join(' ')}"`;
    }
  );
};
