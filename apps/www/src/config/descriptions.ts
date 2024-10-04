import { CopilotPlugin } from '@udecode/plate-ai/react';
import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import {
  ExitBreakPlugin,
  SingleLinePlugin,
  SoftBreakPlugin,
} from '@udecode/plate-break/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { CsvPlugin } from '@udecode/plate-csv';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from '@udecode/plate-font/react';
import { TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { TodoListPlugin } from '@udecode/plate-list/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { ImagePlugin, MediaEmbedPlugin } from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { NormalizeTypesPlugin } from '@udecode/plate-normalizers';
import { ResetNodePlugin } from '@udecode/plate-reset-node/react';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';

import { DragOverCursorPlugin } from '@/plate/demo/plugins/DragOverCursorPlugin';

export const descriptions: Record<string, string> = {
  [AlignPlugin.key]: 'Align your content to different positions.',
  [AutoformatPlugin.key]: 'Apply formatting automatically using shortcodes.',
  [BlockSelectionPlugin.key]: 'Select and manipulate entire text blocks.',
  [BlockquotePlugin.key]: 'Highlight important text or citations.',
  [BoldPlugin.key]: 'Make your text stand out.',
  [CodePlugin.key]: 'Embed code into your text.',
  [CommentsPlugin.key]: 'Add comments to text as marks.',
  [CopilotPlugin.key]: 'AI Copilot',
  [CsvPlugin.key]: 'Copy paste from CSV to Slate.',
  [DatePlugin.key]: 'Add inline date plugins',
  [DeletePlugin.key]:
    'Remove the current block if empty when pressing delete forward',
  [DndPlugin.key]: 'Move blocks within the editor.',
  [DocxPlugin.key]: 'Copy paste from DOCX to Slate.',
  [DragOverCursorPlugin.key]: 'Customize the cursor when dragging.',
  [EmojiPlugin.key]: 'Enhance your text with emojis.',
  [ExcalidrawPlugin.key]: 'Create drawings and diagrams as block nodes.',
  [ExitBreakPlugin.key]: 'Exit a large block using a shortcut.',
  [FontBackgroundColorPlugin.key]: 'Add color to text backgrounds.',
  [FontColorPlugin.key]: 'Highlight text with a specific color.',
  [FontSizePlugin.key]: 'Adjust the size of the text.',
  [HighlightPlugin.key]: 'Mark and reference text for review.',
  [HorizontalRulePlugin.key]: 'Insert horizontal lines.',
  [ImagePlugin.key]: 'Embed images into your document.',
  [IndentListPlugin.key]:
    'Turn any block into a list item. Alternative to List.',
  [IndentPlugin.key]: 'Customize text indentation.',
  [ItalicPlugin.key]: 'Emphasize your text.',
  [JuicePlugin.key]:
    'Inline CSS properties into the `style` attribute when pasting HTML.',
  [KbdPlugin.key]: 'Indicate keyboard inputs or commands.',
  [LineHeightPlugin.key]: 'Adjust the height between lines of text.',
  [LinkPlugin.key]: 'Insert and manage hyperlinks.',
  [MarkdownPlugin.key]: 'Copy paste from MD to Slate.',
  [MediaEmbedPlugin.key]:
    'Embed medias like videos or tweets into your document.',
  [MentionPlugin.key]: 'Enable autocompletion for user mentions.',
  [NodeIdPlugin.key]:
    'Assign unique identifiers to nodes within your document.',
  [NormalizeTypesPlugin.key]: 'Enforce block types using rules.',
  [ParagraphPlugin.key]:
    'The foundational block in your editor, serving as the default block for text entry',
  [ResetNodePlugin.key]: 'Reset the block type using rules.',
  [SelectOnBackspacePlugin.key]:
    'Select the preceding block instead of deleting when pressing backspace.',
  [SingleLinePlugin.key]: 'Restrict the editor to a single block.',
  [SlashPlugin.key]: 'Slash commands',
  [SoftBreakPlugin.key]:
    'Insert line breaks within a block of text without starting a new block.',
  [StrikethroughPlugin.key]:
    'Cross out text to indicate deletion or correction.',
  [SubscriptPlugin.key]: 'Lower portions of your text.',
  [SuperscriptPlugin.key]: 'Elevate portions of your text.',
  [TabbablePlugin.key]:
    'Maintain a consistent tab order for tabbable elements.',
  [TablePlugin.key]:
    'Organize and display data in a structured and resizable tabular format.',
  [TocPlugin.key]: 'Add a table of contents to your document.',
  [TodoListPlugin.key]: 'Manage tasks within your document.',
  [TogglePlugin.key]: 'Add toggles to your document.',
  [TrailingBlockPlugin.key]:
    'Automatically add a new paragraph after the final block.',
  [UnderlinePlugin.key]: 'Emphasize specific words or phrases in your text.',
  caption: 'Add captions to your blocks.',
  code_block: 'Encapsulate blocks of code.',
  column: 'Add column plugins',
  components: 'Components.',
  heading: 'Organize your document with up to 6 headings.',
  list: 'Organize nestable items in a bulleted or numbered list.',
};
