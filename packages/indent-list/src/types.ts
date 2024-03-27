export enum ListStyleType {
  // The marker is traditional Armenian numbering
  Armenian = 'armenian',

  // The marker is a circle
  Circle = 'circle',

  // The marker is plain ideographic numbers
  CjkIdeographic = 'cjk-ideographic',

  // The marker is a number. This is default for <ol>
  Decimal = 'decimal',

  // The marker is a number with leading zeros (01, 02, 03, etc.)
  DecimalLeadingZero = 'decimal-leading-zero',

  // The marker is a filled circle. This is default for <ul>
  Disc = 'disc',

  // The marker is traditional Georgian numbering
  Georgian = 'georgian',

  // The marker is traditional Hebrew numbering
  Hebrew = 'hebrew',

  // The marker is traditional Hiragana numbering
  Hiragana = 'hiragana',

  // The marker is traditional Hiragana iroha numbering
  HiraganaIroha = 'hiragana-iroha',

  // The marker is traditional Katakana numbering
  Katakana = 'katakana',

  // The marker is traditional Katakana iroha numbering
  KatakanaIroha = 'katakana-iroha',

  // The marker is lower-alpha (a, b, c, d, e, etc.)
  LowerAlpha = 'lower-alpha',

  // The marker is lower-greek
  LowerGreek = 'lower-greek',

  // The marker is lower-latin (a, b, c, d, e, etc.)
  LowerLatin = 'lower-latin',

  // The marker is lower-roman (i, ii, iii, iv, v, etc.)
  LowerRoman = 'lower-roman',

  // No marker is shown
  None = 'none',

  // The marker is a square
  Square = 'square',

  // The marker is upper-alpha (A, B, C, D, E, etc.)
  UpperAlpha = 'upper-alpha',

  // The marker is upper-latin (A, B, C, D, E, etc.)
  UpperLatin = 'upper-latin',

  // The marker is upper-roman (I, II, III, IV, V, etc.)
  UpperRoman = 'upper-roman',

  // Sets this property to its default value. Read about initial
  Initial = 'initial',

  // Inherits this property from its parent element. Read about inherit
  Inherit = 'inherit',
}

export interface IMarkerCheckedStyle {
  checked: boolean;
  children: any;
}

export interface IMarkerComponentProps {
  onChange: (checked: boolean) => void;
  checked: boolean;
}
