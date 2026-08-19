import { CsvPlugin } from '@platejs/csv';
import { DocxPastePlugin } from '@platejs/docx-paste';
import { TrailingBlockPlugin } from 'platejs';

import { AIKit } from './ai';
import { AlignKit } from './align';
import { AutoformatKit } from './autoformat';
import { BasicBlocksKit } from './basic-blocks';
import { BasicMarksKit } from './basic-marks';
import { BlockMenuKit } from './block-menu';
import { BlockPlaceholderKit } from './block-placeholder';
import { CalloutKit } from './callout';
import { CodeBlockKit } from './code-block';
import { ColumnKit } from './column';
import { CommentKit } from './comment';
import { CursorOverlayKit } from './cursor-overlay';
import { DateKit } from './date';
import { DiscussionKit } from './discussion';
import { DndKit } from './dnd';
import { EmojiKit } from './emoji';
import { ExitBreakKit } from './exit-break';
import { FixedToolbarKit } from './fixed-toolbar';
import { FloatingToolbarKit } from './floating-toolbar';
import { FontKit } from './font';
import { FootnoteKit } from './footnote';
import { LineHeightKit } from './line-height';
import { LinkKit } from './link';
import { ListKit } from './list';
import { MarkdownKit } from './markdown';
import { MathKit } from './math';
import { MediaKit } from './media';
import { MentionKit } from './mention';
import { SlashKit } from './slash';
import { SuggestionKit } from './suggestion';
import { TableKit } from './table';
import { TocKit } from './toc';
import { ToggleKit } from './toggle';

export const EditorKit = [
  ...AIKit,
  ...BlockMenuKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...CalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...MentionKit,
  ...FootnoteKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  CsvPlugin,
  DocxPastePlugin,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
] as const;
