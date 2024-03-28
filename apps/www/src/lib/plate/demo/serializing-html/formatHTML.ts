/* eslint-disable prefer-template, prefer-regex-literals */
export const formatHTML = (html: string) => {
  let indent = `
`;
  const tab = '\t';
  let i = 0;
  const pre: Record<string, string>[] = [];

  html = html
    .replace(new RegExp('<pre>((.|[\\n\\r])+)?</pre>'), (x) => {
      pre.push({ indent: '', tag: x });
      return '<--TEMPPRE' + i++ + '/-->';
    })
    .replaceAll(new RegExp('<[^<>]+>[^<]?', 'g'), (x) => {
      let ret;
      const tag = new RegExp(`<\\/?([^\\s/>]+)`).exec(x)?.[1];
      const p = new RegExp('<--TEMPPRE(\\d+)/-->').exec(x);

      if (p) pre[Number(p[1])].indent = indent;

      if (
        [
          'area',
          'base',
          'br',
          'col',
          'command',
          'embed',
          'hr',
          'img',
          'input',
          'keygen',
          'link',
          'menuitem',
          'meta',
          'param',
          'source',
          'track',
          'wbr',
        ].includes(tag!)
      )
        // self closing tag
        ret = indent + x;
      else if (x.includes('</')) {
        // close tag
        indent = indent.slice(0, Math.max(0, indent.length - 1));
        ret =
          x.at(-1) === '>'
            ? indent + x
            : indent +
              x.slice(0, Math.max(0, x.length - 1)) +
              indent +
              x.slice(-1, x.length - 1 + x.length);
      } else {
        // open tag
        ret =
          x.at(-1) === '>'
            ? indent + x
            : indent +
              x.slice(0, Math.max(0, x.length - 1)) +
              indent +
              tab +
              x.slice(-1, x.length - 1 + x.length);
        !p && (indent += tab);
      }
      return ret;
    });

  for (i = pre.length; i--; ) {
    html = html.replace(
      '<--TEMPPRE' + i + '/-->',
      pre[i].tag
        .replace(
          '<pre>',
          `<pre>
`
        )
        .replace('</pre>', pre[i].indent + '</pre>')
    );
  }

  return html.charAt(0) ===
    `
`
    ? html.slice(1, 1 + html.length - 1)
    : html;
};
