'use client';

import {
  CalendarIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  SuperscriptIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import {
  BaseBlockquotePlugin,
  BaseCodeBlockPlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseListPlugin,
  BaseParagraphPlugin,
  PLUGINS,
} from 'platejs';
import { BaseCodeDrawingPlugin } from 'platejs/code-drawing';
import { BaseDatePlugin } from 'platejs/date';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseExcalidrawPlugin } from 'platejs/excalidraw';
import { BaseFootnotePlugin } from 'platejs/footnote';
import { BaseColumnPlugin } from 'platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import { BaseImagePlugin, BaseMediaEmbedPlugin } from 'platejs/media';
import { type Editor, useEditor, useEditorReadOnly } from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import { BaseTocPlugin } from 'platejs/toc';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import {
  ToolbarButton,
  ToolbarMenuGroup,
} from '@/registry/components/editor/toolbar';
import { insertBlock } from '@/registry/components/editor/transforms';

import { linkPlugin } from './link';

type Item = {
  icon: React.ReactNode;
  onSelect: () => void;
  value: string;
  focusEditor?: boolean;
  label?: string;
};

type Group = {
  group: string;
  items: Item[];
};

const canRestoreFocus = (
  editor: Editor,
  ownerDocument: Document | undefined,
  activeElement: Element | null | undefined
) => {
  const editable = editor.api.dom.editable();
  const currentActiveElement = ownerDocument?.activeElement;

  return (
    editable?.isConnected === true &&
    !editor.read.view.isReadOnly() &&
    (!currentActiveElement ||
      currentActiveElement === ownerDocument?.body ||
      currentActiveElement === activeElement)
  );
};

function getGroups(editor: Editor): Group[] {
  const groups: Group[] = [];
  const basicBlocks: Item[] = [];
  const lists: Item[] = [];
  const media: Item[] = [];
  const advancedBlocks: Item[] = [];
  const inline: Item[] = [];
  const paragraph = editor.plugin(BaseParagraphPlugin);
  const heading = editor.plugin(BaseHeadingPlugin);
  const list = editor.plugin(BaseListPlugin);
  const table = editor.plugin(BaseTablePlugin);
  const codeBlock = editor.plugin(BaseCodeBlockPlugin);
  const blockquote = editor.plugin(BaseBlockquotePlugin);
  const horizontalRule = editor.plugin(BaseHorizontalRulePlugin);
  const details = editor.plugin(BaseDetailsPlugin);
  const image = editor.plugin(BaseImagePlugin);
  const mediaEmbed = editor.plugin(BaseMediaEmbedPlugin);
  const toc = editor.plugin(BaseTocPlugin);
  const column = editor.plugin(BaseColumnPlugin);
  const equation = editor.plugin(BaseEquationPlugin);
  const excalidraw = editor.plugin(BaseExcalidrawPlugin);
  const codeDrawing = editor.plugin(BaseCodeDrawingPlugin);
  const link = editor.plugin(linkPlugin);
  const date = editor.plugin(BaseDatePlugin);
  const footnote = editor.plugin(BaseFootnotePlugin);
  const inlineEquation = editor.plugin(BaseInlineEquationPlugin);

  if (paragraph.installed) {
    basicBlocks.push({
      icon: <PilcrowIcon />,
      label: 'Paragraph',
      value: PLUGINS.paragraph,
      onSelect: () => {
        const current = editor.plugin(BaseParagraphPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseParagraphPlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (heading.installed) {
    (
      [
        ['heading-1', 'Heading 1', <Heading1Icon key="heading-1" />, 1],
        ['heading-2', 'Heading 2', <Heading2Icon key="heading-2" />, 2],
        ['heading-3', 'Heading 3', <Heading3Icon key="heading-3" />, 3],
      ] as const
    ).forEach(([value, label, icon, level]) => {
      basicBlocks.push({
        icon,
        label,
        value,
        onSelect: () => {
          const current = editor.plugin(BaseHeadingPlugin);

          if (!current.installed || editor.read.view.isReadOnly()) return;

          editor.update((tx) => {
            insertBlock(tx, {
              matches: (block) =>
                !block.listType &&
                block.type === current.schema.type &&
                block.level === level,
              insert: (options) => {
                tx.plugin(BaseHeadingPlugin).insert({ level }, options);
              },
            });
          });
        },
      });
    });
  }

  if (table.installed) {
    basicBlocks.push({
      icon: <TableIcon />,
      label: 'Table',
      value: PLUGINS.table,
      onSelect: () => {
        const current = editor.plugin(BaseTablePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseTablePlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (codeBlock.installed) {
    basicBlocks.push({
      icon: <FileCodeIcon />,
      label: 'Code',
      value: PLUGINS.codeBlock,
      onSelect: () => {
        const current = editor.plugin(BaseCodeBlockPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseCodeBlockPlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (blockquote.installed) {
    basicBlocks.push({
      icon: <QuoteIcon />,
      label: 'Quote',
      value: PLUGINS.blockquote,
      onSelect: () => {
        const current = editor.plugin(BaseBlockquotePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseBlockquotePlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (horizontalRule.installed) {
    basicBlocks.push({
      icon: <MinusIcon />,
      label: 'Divider',
      value: PLUGINS.horizontalRule,
      onSelect: () => {
        const current = editor.plugin(BaseHorizontalRulePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseHorizontalRulePlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (list.installed) {
    (
      [
        ['disc', 'Bulleted list', <ListIcon key="disc" />, 'bulleted'],
        [
          'decimal',
          'Numbered list',
          <ListOrderedIcon key="decimal" />,
          'numbered',
        ],
        ['todo', 'To-do list', <SquareIcon key="todo" />, 'task'],
      ] as const
    ).forEach(([value, label, icon, type]) => {
      lists.push({
        icon,
        label,
        value,
        onSelect: () => {
          if (
            !editor.plugin(BaseListPlugin).installed ||
            editor.read.view.isReadOnly()
          ) {
            return;
          }

          editor.update((tx) => {
            insertBlock(tx, {
              matches: (block) => block.listType === type,
              insert: (options) => {
                tx.plugin(BaseListPlugin).insert({ type }, options);
              },
            });
          });
        },
      });
    });
  }

  if (details.installed) {
    lists.push({
      icon: <ChevronRightIcon />,
      label: 'Details',
      value: PLUGINS.details,
      onSelect: () => {
        const current = editor.plugin(BaseDetailsPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseDetailsPlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (image.installed) {
    media.push({
      focusEditor: false,
      icon: <ImageIcon />,
      label: 'Image',
      value: PLUGINS.image,
      onSelect: () => {
        const current = editor.plugin(BaseImagePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        const block = editor.read.nodes.block();

        if (!block) return;

        const editable = editor.api.dom.editable();
        const ownerDocument = editable?.ownerDocument;
        const activeElement = ownerDocument?.activeElement;

        void current.api
          .insertUrl(
            // oxlint-disable-next-line no-alert -- This copied menu owns its URL input policy.
            () => window.prompt('Enter the URL of the image'),
            {
              replaceEmpty:
                !!block[0].listType || block[0].type !== current.schema.type,
              select: true,
            }
          )
          .then((inserted) => {
            if (
              inserted &&
              canRestoreFocus(editor, ownerDocument, activeElement)
            ) {
              editor.api.dom.focus();
            }
          })
          .catch((error: unknown) => {
            console.error('Could not insert the image URL.', error);
          });
      },
    });
  }

  if (mediaEmbed.installed) {
    media.push({
      focusEditor: false,
      icon: <FilmIcon />,
      label: 'Embed',
      value: PLUGINS.mediaEmbed,
      onSelect: () => {
        const current = editor.plugin(BaseMediaEmbedPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        const block = editor.read.nodes.block();

        if (!block) return;

        const editable = editor.api.dom.editable();
        const ownerDocument = editable?.ownerDocument;
        const activeElement = ownerDocument?.activeElement;

        void current.api
          .insertUrl(
            // oxlint-disable-next-line no-alert -- This copied menu owns its URL input policy.
            () => window.prompt('Enter the URL of the embed'),
            {
              replaceEmpty:
                !!block[0].listType || block[0].type !== current.schema.type,
              select: true,
            }
          )
          .then((inserted) => {
            if (
              inserted &&
              canRestoreFocus(editor, ownerDocument, activeElement)
            ) {
              editor.api.dom.focus();
            }
          })
          .catch((error: unknown) => {
            console.error('Could not insert the embed URL.', error);
          });
      },
    });
  }

  if (toc.installed) {
    advancedBlocks.push({
      icon: <TableOfContentsIcon />,
      label: 'Table of contents',
      value: PLUGINS.toc,
      onSelect: () => {
        const current = editor.plugin(BaseTocPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseTocPlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (column.installed) {
    advancedBlocks.push({
      icon: <Columns3Icon />,
      label: '3 columns',
      value: 'action_three_columns',
      onSelect: () => {
        const current = editor.plugin(BaseColumnPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseColumnPlugin).insert({ columns: 3 }, options);
            },
          });
        });
      },
    });
  }

  if (equation.installed) {
    advancedBlocks.push({
      focusEditor: false,
      icon: <RadicalIcon />,
      label: 'Equation',
      value: PLUGINS.equation,
      onSelect: () => {
        const current = editor.plugin(BaseEquationPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseEquationPlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (excalidraw.installed) {
    advancedBlocks.push({
      icon: <PenToolIcon />,
      label: 'Excalidraw',
      value: PLUGINS.excalidraw,
      onSelect: () => {
        const current = editor.plugin(BaseExcalidrawPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseExcalidrawPlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (codeDrawing.installed) {
    advancedBlocks.push({
      icon: <Code2 />,
      label: 'Code Drawing',
      value: PLUGINS.codeDrawing,
      onSelect: () => {
        const current = editor.plugin(BaseCodeDrawingPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          insertBlock(tx, {
            matches: (block) =>
              !block.listType && block.type === current.schema.type,
            insert: (options) => {
              tx.plugin(BaseCodeDrawingPlugin).insert({}, options);
            },
          });
        });
      },
    });
  }

  if (link.installed) {
    inline.push({
      focusEditor: false,
      icon: <Link2Icon />,
      label: 'Link',
      value: PLUGINS.link,
      onSelect: () => {
        const current = editor.plugin(linkPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        current.store.set({ text: editor.read.text.string() });
        current.api.show('insert', editor.id);
      },
    });
  }

  if (date.installed) {
    inline.push({
      icon: <CalendarIcon />,
      label: 'Date',
      value: PLUGINS.date,
      onSelect: () => {
        if (
          !editor.plugin(BaseDatePlugin).installed ||
          editor.read.view.isReadOnly()
        ) {
          return;
        }

        editor.update((tx) => {
          tx.plugin(BaseDatePlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (footnote.installed) {
    inline.push({
      icon: <SuperscriptIcon />,
      label: 'Footnote',
      value: 'action_footnote',
      onSelect: () => {
        if (
          !editor.plugin(BaseFootnotePlugin).installed ||
          editor.read.view.isReadOnly()
        ) {
          return;
        }

        editor.update((tx) => {
          tx.plugin(BaseFootnotePlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (inlineEquation.installed) {
    inline.push({
      focusEditor: false,
      icon: <RadicalIcon />,
      label: 'Inline Equation',
      value: PLUGINS.inlineEquation,
      onSelect: () => {
        if (
          !editor.plugin(BaseInlineEquationPlugin).installed ||
          editor.read.view.isReadOnly()
        ) {
          return;
        }

        editor.update((tx) => {
          tx.plugin(BaseInlineEquationPlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (basicBlocks.length > 0) {
    groups.push({ group: 'Basic blocks', items: basicBlocks });
  }
  if (lists.length > 0) groups.push({ group: 'Lists', items: lists });
  if (media.length > 0) groups.push({ group: 'Media', items: media });
  if (advancedBlocks.length > 0) {
    groups.push({ group: 'Advanced blocks', items: advancedBlocks });
  }
  if (inline.length > 0) groups.push({ group: 'Inline', items: inline });

  return groups;
}

export function InsertToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const [open, setOpen] = React.useState(false);
  const focusEditorRef = React.useRef<boolean | null>(null);
  const groups = getGroups(editor);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) focusEditorRef.current = null;
        setOpen(nextOpen);
      }}
      modal={false}
    >
      <DropdownMenuTrigger>
        <ToolbarButton
          disabled={readOnly || groups.length === 0}
          pressed={open}
          tooltip="Insert"
          isDropdown
        >
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        onFinalFocus={(event) => {
          const focusEditor = focusEditorRef.current;
          focusEditorRef.current = null;

          if (focusEditor === null) return;

          event.preventDefault();

          if (focusEditor && !editor.read.view.isReadOnly()) {
            editor.api.dom.focus();
          }
        }}
        align="start"
      >
        {groups.map(({ group, items }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {items.map(
              ({ focusEditor = true, icon, label, value, onSelect }) => (
                <DropdownMenuItem
                  key={value}
                  className="min-w-[180px]"
                  onSelect={() => {
                    focusEditorRef.current = focusEditor;
                    onSelect();
                  }}
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              )
            )}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
