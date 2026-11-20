import type { MarkdownFrontmatter } from '../types';

export const MARKDOWN_FRONTMATTER_KEY = 'markdown.frontmatter';

export const BYTE_ORDER_MARK = '\uFEFF';
const FORMATS = ['yaml', 'toml'] as const;
const FENCES = { toml: '+++', yaml: '---' } as const;
const BLANK_LINE = /^[ \t]*$/;
const COMMENT_LINE = /^[ \t]*#/;
const TOML_KEY = String.raw`(?:[A-Za-z0-9_-]+|"(?:[^"\\]|\\.)*"|'[^']*')`;
const TOML_DOTTED_KEY = String.raw`${TOML_KEY}(?:[ \t]*\.[ \t]*${TOML_KEY})*`;

// The setting test is what keeps a note that opens with a rule, such as a rule
// over a heading, a list or a link, as CommonMark.
const GRAMMAR = {
  toml: {
    close: /^\+\+\+[ \t]*$/,
    open: /^\+\+\+[ \t]*$/,
    setting: new RegExp(
      [
        String.raw`^[ \t]*(?:\[\[[ \t]*${TOML_DOTTED_KEY}[ \t]*\]\]|\[[ \t]*${TOML_DOTTED_KEY}[ \t]*\])[ \t]*(?:#.*)?$`,
        String.raw`^[ \t]*${TOML_DOTTED_KEY}[ \t]*=`,
      ].join('|')
    ),
  },
  yaml: {
    close: /^(?:---|\.\.\.)[ \t]*$/,
    open: /^---[ \t]*$/,
    setting: new RegExp(
      [
        String.raw`^[ \t]*(?:"(?:[^"\\]|\\.)*"|'(?:[^']|'')*')[ \t]*:(?:[ \t]|$)`,
        String.raw`^[ \t]*\{`,
        String.raw`^[ \t]*<<[ \t]*:(?:[ \t]|$)`,
        String.raw`^[ \t]*(?!\d+[.)](?:[ \t]|$))[^\s#\-?:,\[\]{}&*!|>'"%@\x60<+=~][^\r\n]*?:(?:[ \t]|$)`,
      ].join('|')
    ),
  },
} as const;

const readMarkdownFrontmatter = (source: string) => {
  const start = source.startsWith(BYTE_ORDER_MARK) ? 1 : 0;
  const format = FORMATS.find((name) => source.startsWith(FENCES[name], start));

  if (!format) return null;

  const grammar = GRAMMAR[format];
  const lineEnding = /\r\n|\r|\n/g;
  const lineAt = (from: number) => {
    if (from >= source.length) return null;
    lineEnding.lastIndex = from;

    const ending = lineEnding.exec(source);

    return ending
      ? {
          end: ending.index + ending[0].length,
          ended: true,
          start: from,
          text: source.slice(from, ending.index),
        }
      : {
          end: source.length,
          ended: false,
          start: from,
          text: source.slice(from),
        };
  };
  const opener = lineAt(start);

  if (!opener?.ended || !grammar.open.test(opener.text)) return null;

  let line = lineAt(opener.end);

  if (line && grammar.open.test(line.text)) {
    return { end: line.end, format, value: '' };
  }
  while (line && (BLANK_LINE.test(line.text) || COMMENT_LINE.test(line.text))) {
    line = lineAt(line.end);
  }
  if (!line || !grammar.setting.test(line.text)) return null;
  do {
    line = lineAt(line.end);
  } while (line && !grammar.close.test(line.text));
  if (!line) return null;

  const value = source
    .slice(opener.end, line.start)
    .replaceAll(/\r\n?/g, '\n')
    .replace(/\n$/u, '');

  // A UTF-8 file cannot hold a lone surrogate, so a value holding one would not
  // read back from the saved file.
  return value.isWellFormed() ? { end: line.end, format, value } : null;
};

export const writeMarkdownFrontmatter = ({
  format,
  value,
}: MarkdownFrontmatter) => {
  const fence = FENCES[format];
  const block = `${fence}\n${value && `${value}\n`}${fence}\n`;

  return readMarkdownFrontmatter(block)?.value === value ? block : null;
};

export const hasMarkdownFrontmatterShape = (
  stored: unknown
): stored is Readonly<{ format: string; value: string }> => {
  if (typeof stored !== 'object' || stored === null) return false;

  const entries = new Map<string, unknown>(Object.entries(stored));

  return (
    entries.size === 2 &&
    typeof entries.get('format') === 'string' &&
    typeof entries.get('value') === 'string'
  );
};

export const isMarkdownFrontmatter = (
  stored: unknown
): stored is MarkdownFrontmatter =>
  hasMarkdownFrontmatterShape(stored) &&
  (stored.format === 'yaml' || stored.format === 'toml');
