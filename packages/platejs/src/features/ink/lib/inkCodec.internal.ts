import type { InkSample } from './BaseInkPlugin';

class InkRefusalError extends TypeError {
  override name = 'InkRefusalError';
}

export const isInkRefusal = (error: unknown) =>
  error instanceof InkRefusalError;

export const refuse = (message: string): never => {
  throw new InkRefusalError(`Ink mark refused: ${message}.`);
};

const decodes = { copies: 0, marks: 0 };

export const countInkDecode = (kind: keyof typeof decodes) => {
  decodes[kind] += 1;
};

export const getInkDecodeMetrics = () => Object.freeze({ ...decodes });

const zigzag = (delta: number) => (delta < 0 ? -delta * 2 - 1 : delta * 2);

const unzigzag = (value: number) =>
  value % 2 === 0 ? value / 2 : -(value + 1) / 2;

const SAFE_ZIGZAG_REACH = Number.MAX_SAFE_INTEGER / 4;

const onGrid = (value: number, steps: number) => {
  const grid = Math.round(value * steps);

  if (Math.abs(grid) > SAFE_ZIGZAG_REACH) refuse('a sample lies too far out');

  return grid === 0 ? 0 : grid / steps;
};

export const roundPixel = (value: number) => onGrid(value, 100);

export const roundSample = ([x, y, pressure, time]: InkSample): InkSample => [
  roundPixel(x),
  roundPixel(y),
  onGrid(pressure, 1000),
  onGrid(time, 1),
];

const GRID_STEPS = [100, 100, 1000, 1];
const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const VALUES = new Map(ALPHABET.split('').map((char, value) => [char, value]));

const toUnpaddedBase64 = (bytes: readonly number[]) => {
  let text = '';

  for (let at = 0; at < bytes.length; at += 3) {
    const chunk =
      (bytes[at] << 16) | ((bytes[at + 1] ?? 0) << 8) | (bytes[at + 2] ?? 0);
    const chars = Math.min(4, Math.ceil(((bytes.length - at) * 4) / 3));

    for (let char = 0; char < chars; char++) {
      text += ALPHABET[(chunk >> (18 - 6 * char)) & 63];
    }
  }

  return text;
};

const fromUnpaddedBase64 = (text: string) => {
  const bytes: number[] = [];
  let held = 0;
  let bits = 0;

  for (const char of text) {
    const value =
      VALUES.get(char) ?? refuse('points must be base64 without = padding');

    held = (held << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push(held >> bits);
      held &= (1 << bits) - 1;
    }
  }

  return bytes;
};

const writeVarint = (bytes: number[], value: number) => {
  let rest = value;

  while (rest >= 0x80) {
    bytes.push((rest % 0x80) | 0x80);
    rest = Math.floor(rest / 0x80);
  }
  bytes.push(rest);
};

export const encodePoints = (samples: readonly InkSample[]) => {
  const bytes: number[] = [];
  let last = [0, 0, 0, 0];

  writeVarint(bytes, samples.length);
  for (const sample of samples) {
    const grid = sample.map((value, at) => Math.round(value * GRID_STEPS[at]));

    for (const [at, value] of grid.entries()) {
      writeVarint(bytes, zigzag(value - last[at]));
    }
    last = grid;
  }

  return toUnpaddedBase64(bytes);
};

export const decodePoints = (text: string): InkSample[] => {
  const bytes = fromUnpaddedBase64(text);
  let at = 0;
  const readVarint = () => {
    let value = 0;
    let scale = 1;

    for (;;) {
      const byte = bytes[at] ?? refuse('points end inside a sample');

      at += 1;

      value += (byte & 0x7f) * scale;
      if (byte < 0x80) break;
      scale *= 0x80;
    }

    return Number.isSafeInteger(value)
      ? value
      : refuse('a points number is too large');
  };
  const count = readVarint();

  if (count > bytes.length / 4) {
    refuse('points name more samples than their bytes hold');
  }

  const samples = new Array<InkSample>(count);
  let last = [0, 0, 0, 0];

  for (let sample = 0; sample < count; sample++) {
    const grid = last.map((value) => value + unzigzag(readVarint()));

    if (grid[2] < 0 || grid[2] > 1000) refuse('a pressure runs from 0 to 1');
    if (grid[3] < last[3]) refuse("a sample's time never goes back");
    if (grid.some((value) => Math.abs(value) > SAFE_ZIGZAG_REACH)) {
      refuse('a sample lies too far out');
    }
    samples[sample] = [grid[0] / 100, grid[1] / 100, grid[2] / 1000, grid[3]];
    last = grid;
  }
  if (at < bytes.length) refuse('points hold bytes after their last sample');
  if (encodePoints(samples) !== text) refuse('points must be what add writes');

  return samples;
};
