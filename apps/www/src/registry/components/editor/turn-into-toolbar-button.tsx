'use client';

import {
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from 'lucide-react';
import {
  BaseBlockquotePlugin,
  BaseCodeBlockPlugin,
  BaseHeadingPlugin,
  BaseListPlugin,
  ElementApi,
  PathApi,
  SelectionApi,
  type Element,
  type HeadingLevel,
  type Path,
} from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseColumnPlugin } from 'platejs/layout';
import {
  type Editor,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useSelectionFragmentProp,
} from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import {
  ToolbarButton,
  ToolbarMenuGroup,
} from '@/registry/components/editor/toolbar';

type LeafFormat =
  | 'decimal'
  | 'disc'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'heading-6'
  | 'text'
  | 'todo';

type LeafItem = {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
  value: LeafFormat;
};

type StructuralActionState = {
  active: boolean;
  eligible: boolean;
};

type StructuralState = {
  code: StructuralActionState;
  columns: StructuralActionState;
  details: StructuralActionState;
  quote: StructuralActionState;
};

const structuralStateEqual = (
  previous: StructuralState | null,
  next: StructuralState
) =>
  !!previous &&
  previous.code.active === next.code.active &&
  previous.code.eligible === next.code.eligible &&
  previous.columns.active === next.columns.active &&
  previous.columns.eligible === next.columns.eligible &&
  previous.details.active === next.details.active &&
  previous.details.eligible === next.details.eligible &&
  previous.quote.active === next.quote.active &&
  previous.quote.eligible === next.quote.eligible;

const readBlocks = (
  editor: Editor,
  mode: 'highest' | 'lowest'
): ReturnType<Editor['read']['nodes']['blocks']> => {
  const selection = editor.read.selection();

  if (
    !selection ||
    (SelectionApi.isText(selection) &&
      !editor.read.selection.isValid(selection))
  ) {
    return [];
  }

  return editor.read.nodes.blocks({ mode });
};

const isContiguousSiblingRun = (
  entries: ReturnType<Editor['read']['nodes']['blocks']>
) => {
  if (entries.length === 0) return false;

  const paths = entries.map(([, path]) => path).toSorted(PathApi.compare);
  const parent = PathApi.parent(paths[0]);
  const firstIndex = paths[0].at(-1);

  return (
    firstIndex !== undefined &&
    paths.every(
      (path, index) =>
        PathApi.equals(PathApi.parent(path), parent) &&
        path.at(-1) === firstIndex + index
    )
  );
};

const hasWrapper = (
  editor: Editor,
  entry: ReturnType<Editor['read']['nodes']['blocks']>[number],
  plugin: typeof BaseBlockquotePlugin | typeof BaseDetailsPlugin
) => {
  const portal = editor.plugin(plugin);

  return (
    portal.installed &&
    (entry[0].type === portal.schema.type ||
      !!editor.read.nodes.above({ at: entry[1], type: plugin }))
  );
};

const getStructuralState = (editor: Editor): StructuralState => {
  const entries = readBlocks(editor, 'highest');
  const hasSelection = entries.length > 0;
  const quote = editor.plugin(BaseBlockquotePlugin);
  const details = editor.plugin(BaseDetailsPlugin);
  const code = editor.plugin(BaseCodeBlockPlugin);
  const columns = editor.plugin(BaseColumnPlugin);
  const quoteActive =
    quote.installed &&
    hasSelection &&
    entries.every((entry) => hasWrapper(editor, entry, BaseBlockquotePlugin));
  const detailsMembership = details.installed
    ? entries.map((entry) => hasWrapper(editor, entry, BaseDetailsPlugin))
    : [];
  const detailsActive = hasSelection && detailsMembership.every(Boolean);
  const detailsMixed = detailsMembership.some(Boolean) && !detailsActive;
  const codeMembership = code.installed
    ? entries.map(([node]) => !node.listType && node.type === code.schema.type)
    : [];
  const codeActive = hasSelection && codeMembership.every(Boolean);
  const codeMixed = codeMembership.some(Boolean) && !codeActive;
  const columnActive =
    columns.installed &&
    entries.length === 1 &&
    (entries[0][0].type === columns.schema.type ||
      !!editor.read.nodes.above({
        at: entries[0][1],
        type: BaseColumnPlugin,
      }));

  return {
    code: {
      active: codeActive,
      eligible: code.installed && !codeMixed && isContiguousSiblingRun(entries),
    },
    columns: {
      active: columnActive,
      eligible: columns.installed && entries.length === 1,
    },
    details: {
      active: detailsActive,
      eligible:
        details.installed &&
        !detailsMixed &&
        (detailsActive || isContiguousSiblingRun(entries)),
    },
    quote: {
      active: quoteActive,
      eligible: quote.installed && hasSelection,
    },
  };
};

const getDetailsPaths = (editor: Editor): Path[] => {
  const details = editor.plugin(BaseDetailsPlugin);

  if (!details.installed) return [];

  const paths = editor.read.nodes
    .blocks({ mode: 'highest' })
    .flatMap(([node, path]) => {
      if (node.type === details.schema.type) return [path];

      const ancestor = editor.read.nodes.above({
        at: path,
        type: BaseDetailsPlugin,
      });

      return ancestor ? [ancestor[1]] : [];
    });

  return paths.filter(
    (path, index) =>
      paths.findIndex((candidate) => PathApi.equals(candidate, path)) === index
  );
};

const getLeafFormat = (editor: Editor, node: Element): LeafFormat => {
  const list = editor.plugin(BaseListPlugin);

  if (list.installed && node.listType) {
    if (node.listType === 'numbered') return 'decimal';
    if (node.listType === 'task') return 'todo';

    return 'disc';
  }

  const heading = editor.plugin(BaseHeadingPlugin);

  if (heading.installed && node.type === heading.schema.type) {
    switch (node.level) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6: {
        return `heading-${node.level}`;
      }
    }
  }

  return 'text';
};

const isLeafFormatActive = (editor: Editor, value: LeafFormat) => {
  const entries = readBlocks(editor, 'lowest');

  return (
    entries.length > 0 &&
    entries.every(([node]) => getLeafFormat(editor, node) === value)
  );
};

const getTurnIntoLabel = (value: LeafFormat | undefined) => {
  switch (value) {
    case 'disc': {
      return 'Bulleted list';
    }
    case 'decimal': {
      return 'Numbered list';
    }
    case 'todo': {
      return 'To-do list';
    }
    case 'heading-1': {
      return 'Heading 1';
    }
    case 'heading-2': {
      return 'Heading 2';
    }
    case 'heading-3': {
      return 'Heading 3';
    }
    case 'heading-4': {
      return 'Heading 4';
    }
    case 'heading-5': {
      return 'Heading 5';
    }
    case 'heading-6': {
      return 'Heading 6';
    }
    case 'text': {
      return 'Text';
    }
    default: {
      return 'Mixed';
    }
  }
};

function TurnIntoLeafItem({
  children,
  icon,
  value,
}: React.PropsWithChildren<{
  icon: React.ReactNode;
  value: LeafFormat;
}>) {
  return (
    <DropdownMenuRadioItem
      className="min-w-[180px] pl-2 *:first:[span]:hidden"
      value={value}
    >
      {icon}
      {children}
    </DropdownMenuRadioItem>
  );
}

export function TurnIntoToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const [open, setOpen] = React.useState(false);
  const leafValue = useSelectionFragmentProp({
    defaultValue: 'text' as LeafFormat,
    getProp: (node) =>
      ElementApi.isElement(node) ? getLeafFormat(editor, node) : undefined,
  }) as LeafFormat | undefined;
  const structural = useEditorSelector(getStructuralState, {
    equalityFn: structuralStateEqual,
  });
  const hasSelection = useEditorSelector(
    (current) => readBlocks(current, 'highest').length > 0
  );
  const heading = editor.plugin(BaseHeadingPlugin);
  const list = editor.plugin(BaseListPlugin);
  const quote = editor.plugin(BaseBlockquotePlugin);
  const details = editor.plugin(BaseDetailsPlugin);
  const code = editor.plugin(BaseCodeBlockPlugin);
  const columns = editor.plugin(BaseColumnPlugin);
  const leafItems: LeafItem[] = [
    {
      icon: <PilcrowIcon />,
      label: 'Text',
      value: 'text',
      onSelect: () => {
        if (
          editor.read.view.isReadOnly() ||
          isLeafFormatActive(editor, 'text')
        ) {
          return;
        }

        editor.update((tx) => {
          if (editor.plugin(BaseListPlugin).installed) {
            tx.plugin(BaseListPlugin).clear();
          }
          tx.blocks.reset();
        });
      },
    },
  ];

  if (heading.installed) {
    (
      [
        ['heading-1', 'Heading 1', <Heading1Icon key="heading-1" />, 1],
        ['heading-2', 'Heading 2', <Heading2Icon key="heading-2" />, 2],
        ['heading-3', 'Heading 3', <Heading3Icon key="heading-3" />, 3],
        ['heading-4', 'Heading 4', <Heading4Icon key="heading-4" />, 4],
        ['heading-5', 'Heading 5', <Heading5Icon key="heading-5" />, 5],
        ['heading-6', 'Heading 6', <Heading6Icon key="heading-6" />, 6],
      ] as const
    ).forEach(([value, label, icon, level]) => {
      leafItems.push({
        icon,
        label,
        value,
        onSelect: () => {
          const current = editor.plugin(BaseHeadingPlugin);

          if (
            !current.installed ||
            editor.read.view.isReadOnly() ||
            isLeafFormatActive(editor, value)
          ) {
            return;
          }

          editor.update((tx) => {
            if (editor.plugin(BaseListPlugin).installed) {
              tx.plugin(BaseListPlugin).clear();
            }
            tx.blocks.set({
              level: level as HeadingLevel,
              type: current.schema.type,
            });
          });
        },
      });
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
      leafItems.push({
        icon,
        label,
        value,
        onSelect: () => {
          if (
            !editor.plugin(BaseListPlugin).installed ||
            editor.read.view.isReadOnly() ||
            isLeafFormatActive(editor, value)
          ) {
            return;
          }

          editor.update((tx) => {
            tx.plugin(BaseListPlugin).clear();
            tx.blocks.reset();
            tx.plugin(BaseListPlugin).toggle({ type });
          });
        },
      });
    });
  }

  const structuralItems = [
    ...(quote.installed
      ? [
          {
            ...structural.quote,
            icon: <QuoteIcon />,
            label: 'Quote',
            onSelect: () => {
              const current = getStructuralState(editor).quote;

              if (!current.eligible || editor.read.view.isReadOnly()) return;

              editor.update((tx) => {
                if (editor.plugin(BaseListPlugin).installed) {
                  tx.plugin(BaseListPlugin).clear();
                }
                tx.plugin(BaseBlockquotePlugin).toggle();
              });
            },
          },
        ]
      : []),
    ...(details.installed
      ? [
          {
            ...structural.details,
            icon: <ChevronRightIcon />,
            label: 'Details',
            onSelect: () => {
              const current = getStructuralState(editor).details;

              if (!current.eligible || editor.read.view.isReadOnly()) return;

              const portal = editor.plugin(BaseDetailsPlugin);

              if (!portal.installed) return;

              if (current.active) {
                const paths = getDetailsPaths(editor);

                if (paths.length === 0) return;

                const selection = editor.read.selection();
                const root = selection && SelectionApi.root(selection);

                portal.update.unwrap({
                  at: SelectionApi.nodes(paths as [Path, ...Path[]], {
                    ...(root ? { root } : {}),
                  }),
                });
              } else {
                portal.update.wrap();
              }
            },
          },
        ]
      : []),
    ...(code.installed
      ? [
          {
            ...structural.code,
            icon: <FileCodeIcon />,
            label: 'Code',
            onSelect: () => {
              const current = getStructuralState(editor).code;
              const portal = editor.plugin(BaseCodeBlockPlugin);

              if (
                !portal.installed ||
                !current.eligible ||
                editor.read.view.isReadOnly()
              ) {
                return;
              }

              portal.update.toggle();
            },
          },
        ]
      : []),
    ...(columns.installed
      ? [
          {
            ...structural.columns,
            icon: <Columns3Icon />,
            label: '3 columns',
            onSelect: () => {
              const current = getStructuralState(editor).columns;
              const portal = editor.plugin(BaseColumnPlugin);

              if (
                !portal.installed ||
                !current.eligible ||
                editor.read.view.isReadOnly()
              ) {
                return;
              }

              portal.update.toggle({ columns: 3 });
            },
          },
        ]
      : []),
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton
          className="min-w-[125px]"
          disabled={readOnly || !hasSelection}
          pressed={open}
          tooltip="Turn into"
          isDropdown
        >
          {getTurnIntoLabel(leafValue)}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar min-w-0"
        onFinalFocus={(event) => {
          event.preventDefault();
          editor.api.dom.focus();
        }}
        align="start"
      >
        <DropdownMenuRadioGroup
          value={leafValue ?? ''}
          onValueChange={(value) => {
            const item = leafItems.find(
              (candidate) => candidate.value === value
            );

            item?.onSelect();
          }}
        >
          <ToolbarMenuGroup label="Turn into">
            {leafItems.map((item) => (
              <TurnIntoLeafItem
                key={item.value}
                icon={item.icon}
                value={item.value}
              >
                {item.label}
              </TurnIntoLeafItem>
            ))}
          </ToolbarMenuGroup>
        </DropdownMenuRadioGroup>

        {structuralItems.length > 0 && (
          <ToolbarMenuGroup label="Structure">
            {structuralItems.map((item) => (
              <DropdownMenuCheckboxItem
                key={item.label}
                checked={item.active}
                className="min-w-[180px]"
                disabled={!item.eligible}
                onSelect={item.onSelect}
              >
                {item.icon}
                {item.label}
              </DropdownMenuCheckboxItem>
            ))}
          </ToolbarMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
