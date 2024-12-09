import type { SidebarNavItem } from '@/types/nav';

import { navToObject } from '@/config/nav-to-object';

export const pluginsNavItems: SidebarNavItem[] = [
  {
    description:
      'AI menu with commands, streaming responses in a preview or directly into the editor.',
    href: '/docs/ai',
    label: 'New',
    title: 'AI',
  },
  {
    description: 'Render AI suggestions ghost text as you type.',
    href: '/docs/copilot',
    label: 'New',
    title: 'AI Copilot',
  },
  {
    description: 'Align your content to different positions.',
    href: '/docs/alignment',
    title: 'Alignment',
  },
  {
    description: 'Apply formatting automatically using shortcodes.',
    href: '/docs/autoformat',
    title: 'Autoformat',
  },
  {
    description: 'Enhance your editor with essential formatting elements.',
    href: '/docs/basic-elements',
    label: 'Element',
    title: 'Basic Elements',
  },
  {
    description: 'Set of essential text formatting options.',
    href: '/docs/basic-marks',
    label: 'Leaf',
    title: 'Basic Marks',
  },
  {
    description: 'Provides quick access to block-specific actions.',
    href: '/docs/block-menu',
    label: 'New',
    title: 'Block Menu',
  },
  {
    description: 'Select and manipulate entire text blocks.',
    href: '/docs/block-selection',
    title: 'Block Selection',
  },
  {
    description: 'Highlight important information or add special notes.',
    href: '/docs/callout',
    label: 'New',
    title: 'Callout',
  },
  {
    description: 'Add captions to your blocks.',
    href: '/docs/caption',
    title: 'Caption',
  },
  {
    description: 'Collaborate with others in a single document.',
    href: '/docs/collaboration',
    title: 'Collaboration',
  },
  {
    description: 'Add columns to your document.',
    href: '/docs/column',
    label: 'Element',
    title: 'Column',
  },
  {
    description: 'Utilities for adding combobox to your editor.',
    href: '/docs/combobox',
    title: 'Combobox',
  },
  {
    description: 'Add comments to text as marks.',
    href: '/docs/comments',
    label: 'Leaf',
    title: 'Comments',
  },
  {
    description: 'A visual overlay for cursors and selections.',
    href: '/docs/cursor-overlay',
    label: 'New',
    title: 'Cursor Overlay',
  },
  {
    description: 'Insert and format dates in your document.',
    href: '/docs/date',
    label: 'Element',
    title: 'Date',
  },
  {
    description:
      'Allows movement of blocks, such as paragraph or tables, within the editor.',
    href: '/docs/dnd',
    title: 'Drag & Drop',
  },
  {
    description: 'Insert emoji inline.',
    href: '/docs/emoji',
    title: 'Emoji',
  },
  {
    description:
      'Enables the insertion and rendering of LaTeX equations in your editor.',
    href: '/docs/equation',
    label: 'New',
    title: 'Equation',
  },
  {
    description: 'Create drawings and diagrams as block nodes.',
    href: '/docs/excalidraw',
    label: 'Element',
    title: 'Excalidraw',
  },
  {
    description: 'Exit a large block using a shortcut.',
    href: '/docs/exit-break',
    title: 'Exit Break',
  },
  {
    description: 'Provide extended formatting options for document content.',
    href: '/docs/font',
    title: 'Font',
  },
  {
    description: 'Strict document structure.',
    href: '/docs/forced-layout',
    title: 'Forced Layout',
  },
  {
    description: 'Mark and reference text for review.',
    href: '/docs/highlight',
    label: 'Leaf',
    title: 'Highlight',
  },
  {
    description:
      'Visually divide and organize content sections with a horizontal line.',
    href: '/docs/horizontal-rule',
    label: 'Element',
    title: 'Horizontal Rule',
  },
  {
    description: 'Customize text indentation.',
    href: '/docs/indent',
    title: 'Indent',
  },
  {
    description: 'Turn any block into a list item.',
    href: '/docs/indent-list',
    title: 'Indent List',
  },
  {
    description: 'Keyboard input markup.',
    href: '/docs/kbd',
    label: 'Leaf',
    title: 'Keyboard Input',
  },
  {
    description: 'Adjust the height between lines of text.',
    href: '/docs/line-height',
    title: 'Line Height',
  },
  {
    description: 'Insert and manage hyperlinks.',
    href: '/docs/link',
    label: 'Element',
    title: 'Link',
  },
  {
    description: 'Organize nestable items in a bulleted or numbered list.',
    href: '/docs/list',
    label: 'Element',
    title: 'List',
  },
  {
    description: 'Embed medias like videos or tweets into your document.',
    href: '/docs/media',
    label: ['Element', 'New'],
    title: 'Media',
  },
  {
    description: 'Enable autocompletion for user mentions.',
    href: '/docs/mention',
    label: 'Element',
    title: 'Mention',
  },
  {
    description: 'A rich multi-select editor.',
    href: '/docs/multi-select',
    label: 'Element',
    title: 'Multi Select',
  },
  {
    description: 'Automatically assign unique IDs to nodes in the document.',
    href: '/docs/node-id',
    label: 'New',
    title: 'Node ID',
  },
  {
    description: 'Reset the block type using rules.',
    href: '/docs/reset-node',
    title: 'Reset Node',
  },
  {
    description:
      'Customize selection and deletion behavior for specific node types.',
    href: '/docs/select',
    label: 'New',
    title: 'Select',
  },
  {
    description: 'Copy paste from CSV to Slate.',
    href: '/docs/csv',
    title: 'Serializing CSV',
  },
  {
    description: 'Copy paste from DOCX to Slate.',
    href: '/docs/docx',
    title: 'Serializing DOCX',
  },
  {
    description: 'Copy paste from HTML to Slate.',
    href: '/docs/html',
    title: 'Serializing HTML',
  },
  {
    description: 'Copy paste from Markdown to Slate.',
    href: '/docs/markdown',
    title: 'Serializing Markdown',
  },
  {
    description: 'Restrict the editor to a single block.',
    href: '/docs/single-line',
    title: 'Single Line',
  },
  {
    description:
      'Slash command menu for quick insertion of various content types.',
    href: '/docs/slash-command',
    label: 'New',
    title: 'Slash Command',
  },
  {
    description:
      'Insert line breaks within a block of text without starting a new block.',
    href: '/docs/soft-break',
    title: 'Soft Break',
  },
  {
    description: 'Maintain a consistent tab order for tabbable elements.',
    href: '/docs/tabbable',
    title: 'Tabbable',
  },
  {
    description:
      'Organize and display data in a structured and resizable tabular format.',
    href: '/docs/table',
    label: 'Element',
    title: 'Table',
  },
  {
    description:
      'Renders a table of contents element with clickable links to headings in the document.',
    href: '/docs/toc',
    label: 'New',
    title: 'Table of Contents',
  },
  {
    description: 'Add toggles to your document.',
    href: '/docs/toggle',
    label: 'Element',
    title: 'Toggle',
  },
  {
    description: 'Ensure a trailing block is always present in the document.',
    href: '/docs/trailing-block',
    label: 'New',
    title: 'Trailing Block',
  },
];

export const pluginNavMap = navToObject(pluginsNavItems);
