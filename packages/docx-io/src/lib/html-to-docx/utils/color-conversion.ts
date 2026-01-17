export const rgbRegex = /rgb\((\d+),\s*([\d.]+),\s*([\d.]+)\)/i;
export const hslRegex = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i;
export const hexRegex = /#([0-9A-F]{6})/i;
export const hex3Regex = /#([0-9A-F])([0-9A-F])([0-9A-F])/i;

export const rgbToHex = (
  red: number | string,
  green: number | string,
  blue: number | string
): string => {
  const hexColorCode = [red, green, blue]
    .map((x) => {
      const hex = Number.parseInt(String(x), 10).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('');

  return hexColorCode;
};

export const hslToHex = (
  hue: number,
  saturation: number,
  luminosity: number
): string => {
  const h = hue / 360;
  const s = saturation / 100;
  const l = luminosity / 100;

  let red: number;
  let green: number;
  let blue: number;

  if (s === 0) {
    red = green = blue = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      let tNorm = t;
      if (tNorm < 0) tNorm += 1;
      if (tNorm > 1) tNorm -= 1;
      if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
      if (tNorm < 1 / 2) return q;
      if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    red = hue2rgb(p, q, h + 1 / 3);
    green = hue2rgb(p, q, h);
    blue = hue2rgb(p, q, h - 1 / 3);
  }
  return [red, green, blue]
    .map((x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('');
};

export const hex3ToHex = (red: string, green: string, blue: string): string => {
  const hexColorCode = [red, green, blue].map((x) => `${x}${x}`).join('');

  return hexColorCode;
};
