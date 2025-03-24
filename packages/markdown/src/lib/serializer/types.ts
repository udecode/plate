import type * as mdast from 'mdast';
export type * as mdast from 'mdast';

export type * as mdastUtilMath from 'mdast-util-math';

export type * as unistLib from 'unist';

export type astMarks =
  | mdast.Delete
  | mdast.Emphasis
  | mdast.InlineCode
  | mdast.Strong
  | mdast.Text;

export type slateMarks = 'bold' | 'code' | 'italic' | 'strikethrough';

// export type TComponents =
//   | mdast.Blockquote
//   | mdast.Code
//   | mdast.Heading
//   | mdast.Image
//   | mdast.Link
//   | mdast.List
//   | mdast.ListItem
//   | mdast.Paragraph
//   | mdast.Table
//   | mdast.TableCell
//   | mdast.TableRow
//   | mdast.ThematicBreak
//   | mdastUtilMath.InlineMath
//   | mdastUtilMath.Math
