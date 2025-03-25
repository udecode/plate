import type * as mdast from 'mdast';
export type * as mdast from 'mdast';

export type * as unistLib from 'unist';

export type astMarks =
  | mdast.Delete
  | mdast.Emphasis
  | mdast.InlineCode
  | mdast.Strong
  | mdast.Text;

export type slateMarks =
  | 'bold'
  | 'code'
  | 'italic'
  | 'strikethrough'
  | 'suggestion';
