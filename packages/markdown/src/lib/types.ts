import type {
  MdDelete,
  MdEmphasis,
  MdInlineCode,
  MdStrong,
  MdText,
} from './mdast';

export type * as unistLib from 'unist';

export type astMarks = MdDelete | MdEmphasis | MdInlineCode | MdStrong | MdText;
