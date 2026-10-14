import { parse, preprocess } from 'micromark';

const parser = parse();

export function isAutolink(source: string): boolean {
  const events = parser.text().write(preprocess()(source, undefined, true));
  return events.some(
    ([action, token]) =>
      action === 'exit' &&
      token.type === 'autolink' &&
      token.start.offset === 0 &&
      token.end.offset === source.length
  );
}
