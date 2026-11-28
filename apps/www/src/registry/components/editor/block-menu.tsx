'use client';

import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseIndentPlugin,
  BaseListPlugin,
  BaseTextAlignPlugin,
  defineCommand,
  ElementApi,
  SelectionApi,
  type Element,
  type ListType,
} from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { BaseLockPlugin } from 'platejs/lock';
import {
  definePlugin,
  type Editor,
  type WrapContentProps,
  useEditor,
  useEditorReadOnly,
  useEditorSelector,
  useSelectionFragmentProp,
} from 'platejs/react';
import * as React from 'react';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/registry/components/editor/context-menu';
import { cutBlocks } from '@/registry/components/editor/dnd';

type LeafFormat = `heading-${1 | 2 | 3 | 4 | 5 | 6}` | ListType | 'text';
type Value = 'askAI' | null;

const alignItems = [
  { label: 'Default', value: 'default' },
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
  { label: 'Justify', value: 'justify' },
] as const;

const readBlocks = (
  editor: ReturnType<typeof useEditor>
): ReturnType<ReturnType<typeof useEditor>['read']['nodes']['blocks']> => {
  const selection = editor.read.selection();

  if (
    !selection ||
    (SelectionApi.isText(selection) &&
      !editor.read.selection.isValid(selection))
  ) {
    return [];
  }

  return editor.read.nodes.blocks({ mode: 'highest' });
};

const getLeafFormat = (
  editor: ReturnType<typeof useEditor>,
  node: Element
): LeafFormat => {
  if (editor.plugin(BaseListPlugin).installed && node.listType) {
    if (node.listType === 'numbered') return 'numbered';
    if (node.listType === 'task') return 'task';

    return 'bulleted';
  }

  const heading = editor.plugin(BaseHeadingPlugin);
  const level = heading.installed ? heading.read.level(node) : undefined;

  return level === undefined ? 'text' : `heading-${level}`;
};

const turnIntoList = defineCommand<Readonly<{ type: ListType }>, Editor>(
  'block-menu:list',
  {
    build: ({ input: { type }, state }) => {
      let applied = false;
      const result = state.transaction((tx) => {
        const selection = tx.selection();

        if (!selection) return;

        const root = SelectionApi.root(selection);
        const [first, ...rest] = tx.nodes
          .blocks({ mode: 'lowest' })
          .map(([, path]) => path);

        if (
          first &&
          !tx.blocks.reset({
            at: SelectionApi.nodes([first, ...rest], {
              mode: 'block',
              ...(root ? { root } : {}),
            }),
            unset: ['level'],
          })
        ) {
          return;
        }
        applied = tx.plugin(BaseListPlugin).set({ type });
      });

      return applied ? result : false;
    },
    locate: false,
  }
);

export function BlockContextMenu({ children }: WrapContentProps) {
  const editor = useEditor();
  const valueRef = React.useRef<Value>(null);
  const [isTouch, setIsTouch] = React.useState(false);
  const readOnly = useEditorReadOnly();
  const hasSelection = useEditorSelector(
    (current) => readBlocks(current).length > 0
  );
  const leafValue = useSelectionFragmentProp({
    defaultValue: 'text',
    getProp: (node) =>
      ElementApi.isElement(node) ? getLeafFormat(editor, node) : undefined,
  }) as LeafFormat | undefined;
  const alignValue = useSelectionFragmentProp({
    getProp: (node) =>
      ElementApi.isElement(node) ? (node.textAlign ?? 'default') : undefined,
  });
  const quoteActive = useEditorSelector((current) => {
    const quote = current.plugin(BaseBlockquotePlugin);
    const entries = readBlocks(current);

    return (
      quote.installed &&
      entries.length > 0 &&
      entries.every(
        ([node, path]) =>
          node.type === quote.schema.type ||
          !!current.read.nodes.above({
            at: path,
            type: BaseBlockquotePlugin,
          })
      )
    );
  });
  const numberedActive = useEditorSelector((current) => {
    const list = current.plugin(BaseListPlugin);

    return (
      list.installed &&
      readBlocks(current).length > 0 &&
      list.read.isActive({ type: 'numbered' })
    );
  });
  const lockInstalled = editor.plugin(BaseLockPlugin).installed;
  const selectionLock = useEditorSelector(
    (current) => {
      const lock = current.plugin(BaseLockPlugin);
      const blocks = readBlocks(current);

      if (!lock.installed || blocks.length === 0) {
        return {
          isSelectionAllLocked: false,
          isSelectionLocked: false,
          isSelectionOwnLocked: false,
        };
      }

      return {
        isSelectionAllLocked: blocks.every(([, path]) =>
          lock.read.isLocked(path)
        ),
        isSelectionLocked: lock.read.isLocked(),
        isSelectionOwnLocked: lock.read.isOwnLocked(),
      };
    },
    {
      equalityFn: (a, b) =>
        a.isSelectionAllLocked === b.isSelectionAllLocked &&
        a.isSelectionLocked === b.isSelectionLocked &&
        a.isSelectionOwnLocked === b.isSelectionOwnLocked,
    }
  );
  const { isSelectionAllLocked, isSelectionLocked, isSelectionOwnLocked } =
    selectionLock;
  const editable = hasSelection && !isSelectionLocked;
  const aiInstalled = editor.plugin(AIChatPlugin).installed;
  const headingInstalled = editor.plugin(BaseHeadingPlugin).installed;
  const quoteInstalled = editor.plugin(BaseBlockquotePlugin).installed;
  const indentInstalled = editor.plugin(BaseIndentPlugin).installed;
  const alignInstalled = editor.plugin(BaseTextAlignPlugin).installed;
  const listInstalled = editor.plugin(BaseListPlugin).installed;
  const leafItems = [
    {
      label: 'Text',
      value: 'text' as const,
      onSelect: () => {
        if (editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          if (!tx.blocks.reset({ unset: ['level'] })) return;
          if (editor.plugin(BaseListPlugin).installed) {
            tx.plugin(BaseListPlugin).clear();
          }
        });
      },
    },
    ...(headingInstalled
      ? (
          [
            ['heading-1', 'Heading 1', 1],
            ['heading-2', 'Heading 2', 2],
            ['heading-3', 'Heading 3', 3],
          ] as const
        ).map(([value, label, level]) => ({
          label,
          value,
          onSelect: () => {
            const heading = editor.plugin(BaseHeadingPlugin);

            if (!heading.installed || editor.read.view.isReadOnly()) return;

            editor.update((tx) => {
              if (!tx.plugin(BaseHeadingPlugin).setLevel(level)) return;
              if (editor.plugin(BaseListPlugin).installed) {
                tx.plugin(BaseListPlugin).clear();
              }
            });
          },
        }))
      : []),
    ...(listInstalled
      ? (
          [
            ['bulleted', 'Bulleted list'],
            ['numbered', 'Numbered list'],
            ['task', 'To-do list'],
          ] as const
        ).map(([value, label]) => ({
          label,
          value,
          onSelect: () => {
            if (
              !editor.plugin(BaseListPlugin).installed ||
              editor.read.view.isReadOnly()
            ) {
              return;
            }

            editor.update.command(turnIntoList, { type: value });
          },
        }))
      : []),
  ];

  React.useEffect(() => {
    const update = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    window.addEventListener('resize', update);
    update();

    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <ContextMenu disabled={isTouch || readOnly} modal={false}>
      <ContextMenuTrigger
        onContextMenu={(event) => {
          if (isTouch) return;

          const { dataset } = event.target as HTMLElement;
          const disabled =
            dataset?.editor === 'true' ||
            readOnly ||
            dataset?.editorOpenContextMenu === 'false';

          if (disabled) {
            event.preventDefault();
            return;
          }

          if (
            (event.target as HTMLElement).closest(
              '[data-editor-prevent-deselect]'
            )
          ) {
            return;
          }

          const selectable = (event.target as HTMLElement).closest<HTMLElement>(
            '[data-editor-node="element"]'
          );
          const node = selectable
            ? editor.api.dom.resolveNode(selectable)
            : null;

          if (
            ElementApi.isElement(node) &&
            (editor.read.selection.nodeMode() === 'object' ||
              !editor.read.selection.contains(node))
          ) {
            editor.update.selection.setNodes([node]);
          }
        }}
      >
        <div className="w-full">
          <div
            className="w-full"
            onContextMenu={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest('[data-board]')
              ) {
                event.stopPropagation();
              }
            }}
          >
            {children}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-64"
        onFinalFocus={(event) => {
          event.preventDefault();
          editor.api.dom.focus();

          if (valueRef.current === 'askAI') {
            const ai = editor.plugin(AIChatPlugin);

            if (ai.installed && !editor.read.view.isReadOnly()) {
              ai.api.show();
            }
          }

          valueRef.current = null;
        }}
      >
        <ContextMenuGroup>
          {aiInstalled && (
            <ContextMenuItem
              onClick={() => {
                if (!editor.read.view.isReadOnly()) valueRef.current = 'askAI';
              }}
            >
              Ask AI
            </ContextMenuItem>
          )}
          <ContextMenuItem
            disabled={!editable}
            onClick={() => {
              if (editor.read.view.isReadOnly()) return;

              editor.update.nodes.remove();
            }}
          >
            Delete
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!hasSelection}
            onClick={() => {
              if (editor.read.view.isReadOnly()) return;

              editor.update((tx) => {
                tx.blocks.duplicate();
              });
            }}
          >
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!editable}
            onClick={() => {
              editor.api.transfer.move({
                announce: 'Moved up',
                to: 'previous',
              });
            }}
          >
            Move up
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!editable}
            onClick={() => {
              editor.api.transfer.move({ announce: 'Moved down', to: 'next' });
            }}
          >
            Move down
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!editable}
            onClick={() => {
              if (editor.read.view.isReadOnly()) return;

              void cutBlocks(editor, editor.read.transfer.nodes());
            }}
          >
            Cut
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!editable}>
              Turn into
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuRadioGroup
                value={leafValue ?? ''}
                onValueChange={(value) => {
                  const item = leafItems.find(
                    (candidate) => candidate.value === value
                  );

                  item?.onSelect();
                }}
              >
                {leafItems.map((item) => (
                  <ContextMenuRadioItem key={item.value} value={item.value}>
                    {item.label}
                  </ContextMenuRadioItem>
                ))}
              </ContextMenuRadioGroup>

              {quoteInstalled && (
                <ContextMenuCheckboxItem
                  checked={quoteActive}
                  onSelect={() => {
                    const quote = editor.plugin(BaseBlockquotePlugin);

                    if (
                      !quote.installed ||
                      !readBlocks(editor).length ||
                      editor.read.view.isReadOnly()
                    ) {
                      return;
                    }

                    editor.update((tx) => {
                      if (
                        tx.plugin(BaseBlockquotePlugin).toggle() &&
                        editor.plugin(BaseListPlugin).installed
                      ) {
                        tx.plugin(BaseListPlugin).clear();
                      }
                    });
                  }}
                >
                  Blockquote
                </ContextMenuCheckboxItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
          {lockInstalled && (
            <ContextMenuItem
              disabled={
                !hasSelection || (isSelectionAllLocked && !isSelectionOwnLocked)
              }
              onClick={() => {
                if (editor.read.view.isReadOnly()) return;

                editor.update((tx) => {
                  const lock = tx.plugin(BaseLockPlugin);

                  if (isSelectionOwnLocked) lock.unlock();
                  else lock.lock();
                });
              }}
            >
              {isSelectionOwnLocked
                ? 'Unlock block'
                : isSelectionAllLocked
                  ? 'Locked by parent'
                  : 'Lock block'}
            </ContextMenuItem>
          )}
        </ContextMenuGroup>

        {(indentInstalled || alignInstalled || numberedActive) && (
          <ContextMenuGroup>
            {indentInstalled && (
              <>
                <ContextMenuItem
                  disabled={!editable}
                  onClick={() => {
                    const indent = editor.plugin(BaseIndentPlugin);

                    if (
                      !indent.installed ||
                      !readBlocks(editor).length ||
                      editor.read.view.isReadOnly()
                    ) {
                      return;
                    }

                    indent.update.increase();
                  }}
                >
                  Indent
                </ContextMenuItem>
                <ContextMenuItem
                  disabled={!editable}
                  onClick={() => {
                    const indent = editor.plugin(BaseIndentPlugin);

                    if (
                      !indent.installed ||
                      !readBlocks(editor).length ||
                      editor.read.view.isReadOnly()
                    ) {
                      return;
                    }

                    indent.update.decrease();
                  }}
                >
                  Outdent
                </ContextMenuItem>
              </>
            )}

            {numberedActive && (
              <>
                <ContextMenuItem
                  disabled={!editable}
                  onClick={() => {
                    const list = editor.plugin(BaseListPlugin);

                    if (!list.installed || editor.read.view.isReadOnly()) {
                      return;
                    }

                    list.update.restart();
                  }}
                >
                  Restart numbering
                </ContextMenuItem>
                <ContextMenuItem
                  disabled={!editable}
                  onClick={() => {
                    const list = editor.plugin(BaseListPlugin);

                    if (!list.installed || editor.read.view.isReadOnly()) {
                      return;
                    }

                    list.update.continue();
                  }}
                >
                  Continue numbering
                </ContextMenuItem>
              </>
            )}

            {alignInstalled && (
              <ContextMenuSub>
                <ContextMenuSubTrigger disabled={!editable}>
                  Align
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuRadioGroup
                    value={
                      alignItems.find((item) => item.value === alignValue)
                        ?.value ?? ''
                    }
                    onValueChange={(value) => {
                      const textAlign = editor.plugin(BaseTextAlignPlugin);
                      const item = alignItems.find(
                        (candidate) => candidate.value === value
                      );

                      if (
                        !item ||
                        !textAlign.installed ||
                        !readBlocks(editor).length ||
                        editor.read.view.isReadOnly()
                      ) {
                        return;
                      }

                      if (item.value === 'default') textAlign.update.clear();
                      else textAlign.update.set(item.value);
                    }}
                  >
                    {alignItems.map((item) => (
                      <ContextMenuRadioItem key={item.value} value={item.value}>
                        {item.label}
                      </ContextMenuRadioItem>
                    ))}
                  </ContextMenuRadioGroup>
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}
          </ContextMenuGroup>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const BlockMenuKit = [
  definePlugin('blockMenuUi', {
    slots: { wrapContent: BlockContextMenu },
  }),
];
