/* eslint-disable prefer-template, prefer-regex-literals */
export const formatHTML = (html: string) => {
  let indent = `
`;
  const tab = '\t';
  let i = 0;
  const pre: Record<string, string>[] = [];

  html = html
    .replace(new RegExp('<pre>((.|\\t|\\n|\\r)+)?</pre>'), (x) => {
      pre.push({ indent: '', tag: x });
      return '<--TEMPPRE' + i++ + '/-->';
    })
    .replace(new RegExp('<[^<>]+>[^<]?', 'g'), (x) => {
      let ret;
      const tag = new RegExp(`<\\/?([^\\s/>]+)`).exec(x)?.[1];
      const p = new RegExp('<--TEMPPRE(\\d+)/-->').exec(x);

      if (p) pre[p[1]].indent = indent;

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
        ].indexOf(tag!) >= 0
      )
        // self closing tag
        ret = indent + x;
      else if (x.indexOf('</') < 0) {
        // open tag
        if (x.charAt(x.length - 1) !== '>')
          ret =
            indent +
            x.substr(0, x.length - 1) +
            indent +
            tab +
            x.substr(x.length - 1, x.length);
        else ret = indent + x;
        !p && (indent += tab);
      } else {
        // close tag
        indent = indent.substr(0, indent.length - 1);
        if (x.charAt(x.length - 1) !== '>')
          ret =
            indent +
            x.substr(0, x.length - 1) +
            indent +
            x.substr(x.length - 1, x.length);
        else ret = indent + x;
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
    ? html.substr(1, html.length - 1)
    : html;
};
