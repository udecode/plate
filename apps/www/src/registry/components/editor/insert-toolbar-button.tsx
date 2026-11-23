'use client';

import {
  CalendarIcon,
  ChevronRightIcon,
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
  type Descendant,
  PathApi,
  PLUGINS,
} from 'platejs';
import { BaseDatePlugin } from 'platejs/date';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseExcalidrawPlugin } from 'platejs/excalidraw';
import { BaseFootnotePlugin } from 'platejs/footnote';
import { BaseColumnGroupPlugin } from 'platejs/layout';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import { BaseImagePlugin, BaseMediaEmbedPlugin } from 'platejs/media';
import {
  type Editor,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
} from 'platejs/react';
import { BaseTablePlugin } from 'platejs/table';
import { BaseTocPlugin } from 'platejs/toc';
import * as React from 'react';
import { toast } from 'sonner';

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

import { linkPlugin } from './link';

type Item = {
  icon: React.ReactNode;
  onSelect: () => void;
  value: string;
  block?: Descendant;
  focusEditor?: boolean;
  label?: string;
};

const blockOf = (
  type: string,
  properties: Readonly<Record<string, unknown>> = {}
): Descendant => ({ ...properties, children: [{ text: '' }], type });

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
  const column = editor.plugin(BaseColumnGroupPlugin);
  const equation = editor.plugin(BaseEquationPlugin);
  const excalidraw = editor.plugin(BaseExcalidrawPlugin);
  const link = editor.plugin(linkPlugin);
  const date = editor.plugin(BaseDatePlugin);
  const footnote = editor.plugin(BaseFootnotePlugin);
  const inlineEquation = editor.plugin(BaseInlineEquationPlugin);

  if (paragraph.installed) {
    basicBlocks.push({
      icon: <PilcrowIcon />,
      block: blockOf(paragraph.schema.type),
      label: 'Paragraph',
      value: PLUGINS.paragraph,
      onSelect: () => {
        const current = editor.plugin(BaseParagraphPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseParagraphPlugin).insert({}, { select: true });
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
        block: blockOf(heading.schema.type, { level }),
        icon,
        label,
        value,
        onSelect: () => {
          const current = editor.plugin(BaseHeadingPlugin);

          if (!current.installed || editor.read.view.isReadOnly()) return;

          editor.update((tx) => {
            tx.plugin(BaseHeadingPlugin).insert({ level }, { select: true });
          });
        },
      });
    });
  }

  if (table.installed) {
    basicBlocks.push({
      icon: <TableIcon />,
      block: blockOf(table.schema.type),
      label: 'Table',
      value: PLUGINS.table,
      onSelect: () => {
        const current = editor.plugin(BaseTablePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseTablePlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (codeBlock.installed) {
    basicBlocks.push({
      icon: <FileCodeIcon />,
      block: blockOf(codeBlock.schema.type),
      label: 'Code',
      value: PLUGINS.codeBlock,
      onSelect: () => {
        const current = editor.plugin(BaseCodeBlockPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseCodeBlockPlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (blockquote.installed) {
    basicBlocks.push({
      icon: <QuoteIcon />,
      block: blockOf(blockquote.schema.type),
      label: 'Quote',
      value: PLUGINS.blockquote,
      onSelect: () => {
        const current = editor.plugin(BaseBlockquotePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseBlockquotePlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (horizontalRule.installed) {
    basicBlocks.push({
      icon: <MinusIcon />,
      block: blockOf(horizontalRule.schema.type),
      label: 'Divider',
      value: PLUGINS.horizontalRule,
      onSelect: () => {
        const current = editor.plugin(BaseHorizontalRulePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseHorizontalRulePlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (list.installed) {
    (
      [
        [
          'disc',
          'Bulleted list',
          <ListIcon key="disc" className="[&:dir(rtl)]:-scale-x-100" />,
          'bulleted',
        ],
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
        block: paragraph.installed
          ? blockOf(paragraph.schema.type, { indent: 1, listType: type })
          : undefined,
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
            tx.plugin(BaseListPlugin).insert({ type }, { select: true });
          });
        },
      });
    });
  }

  if (details.installed) {
    lists.push({
      icon: <ChevronRightIcon className="[&:dir(rtl)]:rotate-180" />,
      block: blockOf(details.schema.type),
      label: 'Details',
      value: PLUGINS.details,
      onSelect: () => {
        const current = editor.plugin(BaseDetailsPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseDetailsPlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (image.installed) {
    media.push({
      focusEditor: false,
      icon: <ImageIcon />,
      block: blockOf(image.schema.type),
      label: 'Image',
      value: PLUGINS.image,
      onSelect: () => {
        const current = editor.plugin(BaseImagePlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        const editable = editor.api.dom.editable();
        const ownerDocument = editable?.ownerDocument;
        const activeElement = ownerDocument?.activeElement;

        void current.api
          .insertUrl(
            // oxlint-disable-next-line no-alert -- This copied menu owns its URL input policy.
            () => window.prompt('Enter the URL of the image'),
            { select: true }
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
      block: blockOf(mediaEmbed.schema.type),
      label: 'Embed',
      value: PLUGINS.mediaEmbed,
      onSelect: () => {
        const current = editor.plugin(BaseMediaEmbedPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        const editable = editor.api.dom.editable();
        const ownerDocument = editable?.ownerDocument;
        const activeElement = ownerDocument?.activeElement;

        void current.api
          .insertUrl(
            () => {
              // oxlint-disable-next-line no-alert -- This copied menu owns its URL input policy.
              const url = window.prompt('Enter the URL of the embed');

              if (!url || current.api.normalizeUrl(url)?.provider) return url;

              toast.error(
                'Paste a YouTube, Vimeo, Dailymotion, Youku, Coub or X link.'
              );

              return null;
            },
            { select: true }
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
      block: blockOf(toc.schema.type),
      label: 'Table of contents',
      value: PLUGINS.toc,
      onSelect: () => {
        const current = editor.plugin(BaseTocPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseTocPlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (column.installed) {
    advancedBlocks.push({
      icon: <Columns3Icon />,
      block: blockOf(column.schema.type),
      label: '3 columns',
      value: 'action_three_columns',
      onSelect: () => {
        const current = editor.plugin(BaseColumnGroupPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseColumnGroupPlugin).insert(
            { columns: 3 },
            { select: true }
          );
        });
      },
    });
  }

  if (equation.installed) {
    advancedBlocks.push({
      focusEditor: false,
      icon: <RadicalIcon />,
      block: blockOf(equation.schema.type),
      label: 'Equation',
      value: PLUGINS.equation,
      onSelect: () => {
        const current = editor.plugin(BaseEquationPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseEquationPlugin).insert({}, { select: true });
        });
      },
    });
  }

  if (excalidraw.installed) {
    advancedBlocks.push({
      icon: <PenToolIcon />,
      block: blockOf(excalidraw.schema.type),
      label: 'Excalidraw',
      value: PLUGINS.excalidraw,
      onSelect: () => {
        const current = editor.plugin(BaseExcalidrawPlugin);

        if (!current.installed || editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          tx.plugin(BaseExcalidrawPlugin).insert({}, { select: true });
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

const noRefusedItems: string[] = [];

const getNoRefusedItems = () => noRefusedItems;

const getRefusedItems = (editor: Editor) => {
  const entry = editor.read.selection() ? editor.read.nodes.block() : undefined;

  if (!entry) return noRefusedItems;

  const at = PathApi.next(entry[1]);
  const root = editor.read.view.root();

  return getGroups(editor).flatMap(({ items }) =>
    items.flatMap(({ block, value }) =>
      block && !editor.read.schema.canPlace([block], { at, root })
        ? [value]
        : []
    )
  );
};

export function InsertToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const [open, setOpen] = React.useState(false);
  const groups = getGroups(editor);
  const refused = useEditorSelector(open ? getRefusedItems : getNoRefusedItems);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
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
        align="start"
      >
        {groups.map(({ group, items }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {items.map(
              ({ focusEditor = true, icon, label, value, onSelect }) => (
                <DropdownMenuItem
                  key={value}
                  className="min-w-[180px]"
                  disabled={refused.includes(value)}
                  finalFocus={
                    focusEditor
                      ? () => {
                          if (!editor.read.view.isReadOnly()) {
                            editor.api.dom.focus();
                          }
                        }
                      : false
                  }
                  onSelect={onSelect}
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
