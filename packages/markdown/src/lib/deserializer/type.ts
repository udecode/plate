import type { MdDelete, MdEmphasis, MdInlineCode, MdStrong } from '../mdast';

export type Decoration = Readonly<
  Partial<
    Record<
      | (MdDelete | MdEmphasis | MdInlineCode | MdStrong)['type']
      | plateOnlyMarks,
      true
    >
  >
>;

type plateOnlyMarks = (string & {}) | 'underline';
