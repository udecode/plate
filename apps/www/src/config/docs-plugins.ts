import type { SidebarNavItem } from '@/types/nav';

import { navToObject } from '@/config/nav-to-object';

export const pluginsNavItems: SidebarNavItem[] = [
  {
    items: [
      {
        description:
          'AI menu with commands, streaming responses in a preview or directly into the editor.',
        href: '/docs/ai',
        keywords: ['chat'],
        title: 'Stream',
      },
      {
        description: 'Render AI suggestions ghost text as you type.',
        href: '/docs/copilot',
        title: 'Copilot',
      },
    ].map((item) => ({
      ...item,
      keywords: ['ai'],
    })),
    label: 'New',
    title: 'AI',
  },
  {
    items: [
      {
        description: 'Add comments to text as marks.',
        href: '/docs/comments',
        keywords: ['leaf'],
        title: 'Comments',
      },
      {
        description: 'Add suggestions to text as marks.',
        href: '/docs/suggestion',
        keywords: ['leaf'],
        label: 'Experimental',
        title: 'Suggestion',
      },
      {
        description: 'Collaborate with others in a single document.',
        href: '/docs/yjs',
        label: 'New',
        title: 'Yjs',
      },
    ],
    title: 'Collaboration',
  },
  {
    items: [
      {
        description: 'Enhance your editor with essential formatting elements.',
        href: '/docs/basic-blocks',
        items: [
          {
            description:
              'Create blockquotes to emphasize important information.',
            href: '/docs/blockquote',
            title: 'Blockquote',
          },
          {
            description:
              'Create headings of various levels to structure content.',
            href: '/docs/heading',
            title: 'Heading',
          },
          {
            description:
              'Visually divide and organize content sections with a horizontal line.',
            href: '/docs/horizontal-rule',
            title: 'Horizontal Rule',
          },
        ].map((item) => ({
          ...item,
          keywords: ['element'],
        })),
        title: 'Basic Blocks',
      },
      {
        description: 'Highlight important information or add special notes.',
        href: '/docs/callout',
        title: 'Callout',
      },
      {
        description: 'Display code with syntax highlighting.',
        href: '/docs/code-block',
        title: 'Code Block',
      },
      {
        description: 'Add columns to your document.',
        href: '/docs/column',
        title: 'Column',
      },
      {
        description: 'Insert and format dates in your document.',
        href: '/docs/date',
        title: 'Date',
      },
      {
        description:
          'Enables the insertion and rendering of LaTeX equations in your editor.',
        href: '/docs/equation',
        title: 'Equation',
      },
      // Broken
      // {
      //   description: 'Create drawings and diagrams as block nodes.',
      //   href: '/docs/excalidraw',
      //   title: 'Excalidraw',
      // },
      {
        description: 'Insert and manage hyperlinks.',
        href: '/docs/link',
        title: 'Link',
      },
      {
        description: 'Organize nestable items in a bulleted or numbered list.',
        href: '/docs/list-classic',
        title: 'List Classic',
      },
      {
        description: 'Embed medias like videos or tweets into your document.',
        href: '/docs/media',
        title: 'Media',
      },
      {
        description: 'Enable autocompletion for user mentions.',
        href: '/docs/mention',
        title: 'Mention',
      },
      {
        description:
          'Organize and display data in a structured and resizable tabular format.',
        href: '/docs/table',
        title: 'Table',
      },
      {
        description:
          'Renders a table of contents element with clickable links to headings in the document.',
        href: '/docs/toc',
        title: 'Table of Contents',
      },
      {
        description: 'Add toggles to your document.',
        href: '/docs/toggle',
        title: 'Toggle',
      },
    ].map((item) => ({
      ...item,
      keywords: ['element'],
    })),
    title: 'Elements',
  },
  {
    description: 'Set of essential text formatting options.',
    href: '/docs/basic-marks',
    items: [
      {
        description: 'Apply bold formatting to emphasize important text.',
        href: '/docs/bold',
        title: 'Bold',
      },
      {
        description:
          'Apply italic formatting for emphasis or stylistic purposes.',
        href: '/docs/italic',
        title: 'Italic',
      },
      {
        description: 'Apply underline formatting to text.',
        href: '/docs/underline',
        title: 'Underline',
      },
      {
        description: 'Format inline code snippets and technical terms.',
        href: '/docs/code',
        title: 'Code',
      },
      {
        description: 'Highlight important text with background colors.',
        href: '/docs/highlight',
        title: 'Highlight',
      },
      {
        description: 'Display keyboard shortcuts and key combinations.',
        href: '/docs/kbd',
        title: 'Keyboard Input',
      },
      {
        description:
          'Apply strikethrough formatting to indicate deleted content.',
        href: '/docs/strikethrough',
        title: 'Strikethrough',
      },
      {
        description: 'Format text as subscript for mathematical expressions.',
        href: '/docs/subscript',
        title: 'Subscript',
      },
      {
        description: 'Format text as superscript for mathematical expressions.',
        href: '/docs/superscript',
        title: 'Superscript',
      },
    ].map((item) => ({
      ...item,
      keywords: ['leaf'],
    })),
    title: 'Marks',
  },
  {
    items: [
      {
        items: [
          {
            description: 'Set font styles to your content.',
            href: '/docs/font',
            title: 'Font',
          },
          {
            description: 'Adjust the height between lines of text.',
            href: '/docs/line-height',
            title: 'Line Height',
          },
          {
            description: 'Align your content to different positions.',
            href: '/docs/text-align',
            title: 'Text Align',
          },
        ],
        title: 'Basic Styles',
      },
      {
        description: 'Customize text indentation.',
        href: '/docs/indent',
        title: 'Indent',
      },
      {
        description: 'Turn any block into a list item.',
        href: '/docs/list',
        title: 'List',
      },
    ],
    title: 'Styles',
  },
  {
    items: [
      {
        items: [
          {
            description: 'Exit a large block using a shortcut.',
            href: '/docs/exit-break',
            title: 'Exit Break',
          },
          {
            description: 'Strict document structure.',
            href: '/docs/forced-layout',
            title: 'Forced Layout',
          },
          {
            description: 'Restrict the editor to a single block.',
            href: '/docs/single-block',
            title: 'Single Block',
          },
          {
            description:
              'Ensure a trailing block is always present in the document.',
            href: '/docs/trailing-block',
            title: 'Trailing Block',
          },
        ],
        title: 'Utils',
      },
      {
        description: 'Apply formatting automatically using shortcodes.',
        href: '/docs/autoformat',
        title: 'Autoformat',
      },
      {
        description: 'Provides quick access to block-specific actions.',
        href: '/docs/block-menu',
        title: 'Block Menu',
      },
      {
        description: 'Show placeholder when a block is empty.',
        href: '/docs/block-placeholder',
        label: 'New',
        title: 'Block Placeholder',
      },
      {
        description: 'Select and manipulate entire text blocks.',
        href: '/docs/block-selection',
        title: 'Block Selection',
      },
      {
        description: 'Add captions to your blocks.',
        href: '/docs/caption',
        title: 'Caption',
      },
      {
        description: 'Utilities for adding combobox to your editor.',
        href: '/docs/combobox',
        items: [
          {
            description: 'Insert emoji inline.',
            href: '/docs/emoji',
            title: 'Emoji',
          },
          {
            description: 'Enable autocompletion for user mentions.',
            href: '/docs/mention',
            label: 'Element',
            title: 'Mention',
          },
          {
            description:
              'Slash command menu for quick insertion of various content types.',
            href: '/docs/slash-command',
            title: 'Slash Command',
          },
        ],
        title: 'Combobox',
      },
      {
        description: 'A visual overlay for cursors and selections.',
        href: '/docs/cursor-overlay',
        title: 'Cursor Overlay',
      },
      {
        description:
          'Allows movement of blocks, such as paragraph or tables, within the editor.',
        href: '/docs/dnd',
        title: 'Drag & Drop',
      },
      {
        description: 'Maintain a consistent tab order for tabbable elements.',
        href: '/docs/tabbable',
        title: 'Tabbable',
      },
      {
        description: 'A rich multi-select editor.',
        href: '/docs/multi-select',
        label: 'Editor',
        title: 'Multi Select',
      },
    ],
    title: 'Functionality',
  },
  {
    items: [
      {
        description: 'Copy paste from CSV to Slate.',
        href: '/docs/csv',
        title: 'CSV',
      },
      {
        description: 'Copy paste from DOCX to Slate.',
        href: '/docs/docx',
        title: 'DOCX',
      },
      {
        description: 'Copy paste from HTML to Slate.',
        href: '/docs/html',
        title: 'HTML',
      },
      {
        description: 'Copy paste from Markdown to Slate.',
        href: '/docs/markdown',
        label: 'New',
        title: 'Markdown',
      },
    ],
    title: 'Serializing',
  },
];

export const pluginNavMap = navToObject(pluginsNavItems);
