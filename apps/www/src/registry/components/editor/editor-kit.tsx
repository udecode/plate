'use client';

import type { Value } from '@udecode/plate';

import { type TPlateEditor, useEditorRef } from '@udecode/plate/react';

import { AIKit } from './plugins/ai-kit';
import { AlignKit } from './plugins/align-kit';
import { AutoformatKit } from './plugins/autoformat-kit';
import { BasicElementsKit } from './plugins/basic-elements-kit';
import { BasicMarksKit } from './plugins/basic-marks-kit';
import { BlockMenuKit } from './plugins/block-menu-kit';
import { BlockPlaceholderKit } from './plugins/block-placeholder-kit';
import { CalloutKit } from './plugins/callout-kit';
import { ColumnKit } from './plugins/column-kit';
import { CommentKit } from './plugins/comment-kit';
import { CursorOverlayKit } from './plugins/cursor-overlay-kit';
import { DateKit } from './plugins/date-kit';
import { DiscussionKit } from './plugins/discussion-kit';
import { DndKit } from './plugins/dnd-kit';
import { DocxKit } from './plugins/docx-kit';
import { EditingKit } from './plugins/editing-kit';
import { EmojiKit } from './plugins/emoji-kit';
import { FixedToolbarKit } from './plugins/fixed-toolbar-kit';
import { FloatingToolbarKit } from './plugins/floating-toolbar-kit';
import { FontKit } from './plugins/font-kit';
import { HighlightKit } from './plugins/highlight-kit';
import { HorizontalRuleKit } from './plugins/hr-kit';
import { KbdKit } from './plugins/kbd-kit';
import { LineHeightKit } from './plugins/line-height-kit';
import { LinkKit } from './plugins/link-kit';
import { ListKit } from './plugins/list-kit';
import { MarkdownKit } from './plugins/markdown-kit';
import { MathKit } from './plugins/math-kit';
import { MediaKit } from './plugins/media-kit';
import { MentionKit } from './plugins/mention-kit';
import { SlashKit } from './plugins/slash-kit';
import { SuggestionKit } from './plugins/suggestion-kit';
import { TableKit } from './plugins/table-kit';
import { TocKit } from './plugins/toc-kit';
import { ToggleKit } from './plugins/toggle-kit';

export const EditorKit = [
  ...AIKit,

  // Elements
  ...BasicElementsKit,
  ...HorizontalRuleKit,
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

  // Marks
  ...BasicMarksKit,
  ...FontKit,
  ...HighlightKit,
  ...KbdKit,

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
  ...BlockMenuKit,
  ...DndKit,
  ...EmojiKit,
  ...EditingKit,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
