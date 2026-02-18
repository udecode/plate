export interface UnusedCharGeneratorOptions {
  skipChars?: string;
}

export function* unusedCharGenerator({
  skipChars = '',
}: UnusedCharGeneratorOptions = {}): Generator<string> {
  const skipSet = new Set(skipChars);

  for (let code = 'A'.codePointAt(0)!; ; code++) {
    const c = String.fromCodePoint(code);

    if (skipSet.has(c)) continue;

    yield c;
  }
}
