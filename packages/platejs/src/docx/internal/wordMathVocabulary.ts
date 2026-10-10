export const WORD_MATH_VARIANTS: ReadonlyArray<
  Readonly<{
    mathvariant: string;
    scr?: string;
    sty?: string;
    tex: string;
  }>
> = [
  { mathvariant: 'normal', sty: 'p', tex: '\\mathrm' },
  { mathvariant: 'bold', sty: 'b', tex: '\\mathbf' },
  { mathvariant: 'italic', sty: 'i', tex: '\\mathit' },
  { mathvariant: 'bold-italic', sty: 'bi', tex: '\\boldsymbol' },
  { mathvariant: 'double-struck', scr: 'double-struck', tex: '\\mathbb' },
  { mathvariant: 'script', scr: 'script', tex: '\\mathcal' },
  { mathvariant: 'fraktur', scr: 'fraktur', tex: '\\mathfrak' },
  { mathvariant: 'sans-serif', scr: 'sans-serif', sty: 'p', tex: '\\mathsf' },
  { mathvariant: 'monospace', scr: 'monospace', sty: 'p', tex: '\\mathtt' },
];

/** Accents KaTeX draws over a base, as Word's combining character and TeX. */
export const WORD_MATH_ACCENTS: ReadonlyArray<
  Readonly<{
    chars: readonly string[];
    combining: string;
    tex: string;
  }>
> = [
  { chars: ['^', 'ˆ'], combining: '\u0302', tex: '\\hat' },
  { chars: ['ˇ'], combining: '\u030C', tex: '\\check' },
  { chars: ['~', '˜'], combining: '\u0303', tex: '\\tilde' },
  { chars: ['ˊ', '´'], combining: '\u0301', tex: '\\acute' },
  { chars: ['ˋ', '`'], combining: '\u0300', tex: '\\grave' },
  { chars: ['˙'], combining: '\u0307', tex: '\\dot' },
  { chars: ['¨'], combining: '\u0308', tex: '\\ddot' },
  { chars: ['ˉ', '¯'], combining: '\u0304', tex: '\\bar' },
  { chars: ['\u20D7', '→'], combining: '\u20D7', tex: '\\vec' },
  { chars: ['˘'], combining: '\u0306', tex: '\\breve' },
  { chars: ['˚'], combining: '\u030A', tex: '\\mathring' },
];
