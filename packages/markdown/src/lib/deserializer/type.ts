import type { MdDelete, MdEmphasis, MdInlineCode, MdStrong } from '../mdast';

export type Decoration = Readonly<
  Partial<
    Record<
      | (MdDelete | MdEmphasis | MdInlineCode | MdStrong)['type']
      | plateOnlyMarks,
      boolean | string
    >
  >
>;

type plateOnlyMarks =
  | (string & {})
  | 'backgroundColor'
  | 'color'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'underline';
