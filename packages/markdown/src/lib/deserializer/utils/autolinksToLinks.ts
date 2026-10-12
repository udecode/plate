// CommonMark autolinks: `<https://example.com>` and `<user@example.com>`.
// https://spec.commonmark.org/0.31.2/#autolinks
const URL_AUTOLINK = String.raw`<([a-zA-Z][a-zA-Z0-9+.-]{1,31}:\/\/[^\s<>]*)>`;
const MAILTO_AUTOLINK = String.raw`<(mailto:[^\s<>]+)>`;
const EMAIL_AUTOLINK = String.raw`<([a-zA-Z0-9.!#$%&'*+/=?^_\x60{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>`;

// A code span (kept as is), or one of the autolinks above
const INLINE_TOKEN = new RegExp(
  String.raw`(\x60+)[\s\S]*?[^\x60]\1(?!\x60)|${URL_AUTOLINK}|${MAILTO_AUTOLINK}|${EMAIL_AUTOLINK}`,
  'g'
);

const FENCE_OPEN = /^[\t >]*(`{3,}|~{3,})/;
const LINE_PREFIX = /^[\t >]*/;
const ASCII_PUNCTUATION = /[!-/:-@[-`{-~]/g;
const DESTINATION_SPECIAL = /[\\()&]/g;

const toLink = (label: string, url: string) =>
  `[${label.replaceAll(ASCII_PUNCTUATION, String.raw`\$&`)}](${url.replaceAll(
    DESTINATION_SPECIAL,
    String.raw`\$&`
  )})`;

const isEscaped = (text: string, index: number) => {
  let backslashes = 0;

  for (let i = index - 1; i >= 0 && text[i] === '\\'; i--) {
    backslashes++;
  }

  return backslashes % 2 === 1;
};

const convertInline = (text: string) =>
  text.replace(
    INLINE_TOKEN,
    (
      match,
      _ticks,
      url?: string,
      mailto?: string,
      email?: string,
      offset?: number
    ) => {
      if (isEscaped(text, offset!)) return match;
      if (url) return toLink(url, url);
      if (mailto) return toLink(mailto, mailto);
      if (email) return toLink(email, `mailto:${email}`);

      return match;
    }
  );

/**
 * MDX does not support CommonMark autolinks: `<user@example.com>` or
 * `<https://example.com>` is parsed as the start of a JSX tag, which fails and
 * aborts the parse. Rewrite them as regular links, which give the same mdast
 * (`link` with the same `url` and text), leaving code untouched.
 */
export const autolinksToLinks = (markdown: string): string => {
  if (!markdown.includes('<')) return markdown;

  const lines = markdown.split('\n');
  const output: string[] = [];
  let pending: string[] = [];
  let fence: string | null = null;

  const flush = () => {
    if (pending.length > 0) {
      output.push(convertInline(pending.join('\n')));
      pending = [];
    }
  };

  for (const line of lines) {
    if (fence) {
      output.push(line);

      const trimmed = line.replace(LINE_PREFIX, '').trimEnd();

      if (
        trimmed.length >= fence.length &&
        trimmed === fence[0].repeat(trimmed.length)
      ) {
        fence = null;
      }

      continue;
    }

    const open = FENCE_OPEN.exec(line);

    if (open) {
      flush();
      fence = open[1];
      output.push(line);
      continue;
    }

    pending.push(line);
  }

  flush();

  return output.join('\n');
};
