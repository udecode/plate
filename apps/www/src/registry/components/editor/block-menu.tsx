'use client';

import {
  BaseBlockquotePlugin,
  BaseHeadingPlugin,
  BaseIndentPlugin,
  BaseListPlugin,
  BaseTextAlignPlugin,
  ElementApi,
  SelectionApi,
  type Element,
} from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import {
  definePlugin,
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

type LeafFormat = 'heading-1' | 'heading-2' | 'heading-3' | 'text';
type Value = 'askAI' | null;

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
  const heading = editor.plugin(BaseHeadingPlugin);

  if (heading.installed && node.type === heading.schema.type) {
    if (node.level === 1) return 'heading-1';
    if (node.level === 2) return 'heading-2';
    if (node.level === 3) return 'heading-3';
  }

  return 'text';
};

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
  const aiInstalled = editor.plugin(AIChatPlugin).installed;
  const headingInstalled = editor.plugin(BaseHeadingPlugin).installed;
  const quoteInstalled = editor.plugin(BaseBlockquotePlugin).installed;
  const indentInstalled = editor.plugin(BaseIndentPlugin).installed;
  const alignInstalled = editor.plugin(BaseTextAlignPlugin).installed;
  const leafItems = [
    {
      label: 'Text',
      value: 'text' as const,
      onSelect: () => {
        if (editor.read.view.isReadOnly()) return;

        editor.update((tx) => {
          if (editor.plugin(BaseListPlugin).installed) {
            tx.plugin(BaseListPlugin).clear();
          }
          tx.blocks.reset();
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
              if (editor.plugin(BaseListPlugin).installed) {
                tx.plugin(BaseListPlugin).clear();
              }
              tx.blocks.set({ level, type: heading.schema.type });
            });
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
          const { dataset } = event.target as HTMLElement;
          const disabled =
            dataset?.editor === 'true' ||
            readOnly ||
            dataset?.editorOpenContextMenu === 'false';

          if (disabled) {
            event.preventDefault();
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
            !editor.read.selection.contains(node)
          ) {
            editor.update.selection.setNodes([node]);
          }
        }}
      >
        <div className="w-full">{children}</div>
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
            disabled={!hasSelection}
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
          <ContextMenuSub>
            <ContextMenuSubTrigger disabled={!hasSelection}>
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
                      if (editor.plugin(BaseListPlugin).installed) {
                        tx.plugin(BaseListPlugin).clear();
                      }
                      tx.plugin(BaseBlockquotePlugin).toggle();
                    });
                  }}
                >
                  Blockquote
                </ContextMenuCheckboxItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>

        {(indentInstalled || alignInstalled) && (
          <ContextMenuGroup>
            {indentInstalled && (
              <>
                <ContextMenuItem
                  disabled={!hasSelection}
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
                  disabled={!hasSelection}
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

            {alignInstalled && (
              <ContextMenuSub>
                <ContextMenuSubTrigger disabled={!hasSelection}>
                  Align
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <ContextMenuItem
                      key={align}
                      onClick={() => {
                        const textAlign = editor.plugin(BaseTextAlignPlugin);

                        if (
                          !textAlign.installed ||
                          !readBlocks(editor).length ||
                          editor.read.view.isReadOnly()
                        ) {
                          return;
                        }

                        textAlign.update.set(align);
                      }}
                    >
                      {align[0].toUpperCase() + align.slice(1)}
                    </ContextMenuItem>
                  ))}
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
