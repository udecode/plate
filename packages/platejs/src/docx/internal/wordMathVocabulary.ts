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
  { chars: ['^', 'ˆ'], combining: '̂', tex: '\\hat' },
  { chars: ['ˇ'], combining: '̌', tex: '\\check' },
  { chars: ['~', '˜'], combining: '̃', tex: '\\tilde' },
  { chars: ['ˊ', '´'], combining: '́', tex: '\\acute' },
  { chars: ['ˋ', '`'], combining: '̀', tex: '\\grave' },
  { chars: ['˙'], combining: '̇', tex: '\\dot' },
  { chars: ['¨'], combining: '̈', tex: '\\ddot' },
  { chars: ['ˉ', '¯'], combining: '̄', tex: '\\bar' },
  { chars: ['⃗', '→'], combining: '⃗', tex: '\\vec' },
  { chars: ['˘'], combining: '̆', tex: '\\breve' },
  { chars: ['˚'], combining: '̊', tex: '\\mathring' },
];
