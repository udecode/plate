/**
 * Remove all class names that do not start with one of preserveClassNames (`slate-` by default)
 */
export const stripClassNames = (
  html: string,
  { preserveClassNames = ['slate-'] }: { preserveClassNames?: string[] }
) => {
  const allClasses = html.split(/(class="[^"]*")/g);

  let filteredHtml = '';
  allClasses.forEach((item, index) => {
    if (index % 2 === 0) {
      return (filteredHtml += item);
    }
    const preserveRegExp = new RegExp(
      preserveClassNames.map((cn) => `${cn}[^"\\s]*`).join('|'),
      'g'
    );
    const slateClassNames = item.match(preserveRegExp);
    if (slateClassNames) {
      filteredHtml += `class="${slateClassNames.join(' ')}"`;
    }
  });

  return filteredHtml;
};
