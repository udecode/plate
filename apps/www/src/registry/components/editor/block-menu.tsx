'use client';

import { ElementApi, PLUGINS } from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import {
  IndentPlugin,
  definePlatePlugin,
  useEditor,
  useEditorReadOnly,
} from 'platejs/react';
import * as React from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/registry/components/editor/context-menu';
import { applyBlockAction } from '@/registry/components/editor/transforms';

type Value = 'askAI' | null;

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const editor = useEditor();
  const valueRef = React.useRef<Value>(null);
  const [isTouch, setIsTouch] = React.useState(false);
  const readOnly = useEditorReadOnly();

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

  const handleTurnInto = React.useCallback(
    (action: string) => {
      editor.read.selection.nodes().forEach(([, path]) => {
        applyBlockAction(editor, action, { at: path });
      });
    },
    [editor]
  );

  const handleAlign = React.useCallback(
    (align: 'center' | 'left' | 'right') => {
      editor.read.selection.nodes().forEach(([, path]) => {
        editor.update.nodes.set({ textAlign: align }, { at: path });
      });
    },
    [editor]
  );
  const handleIndent = React.useCallback(
    (increase: boolean) => {
      editor.read.selection.nodes().forEach(([, path]) => {
        editor
          .plugin(IndentPlugin)
          .update[increase ? 'increase' : 'decrease']({ nodes: { at: path } });
      });
    },
    [editor]
  );

  if (isTouch) {
    return children;
  }

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger
        onContextMenu={(event) => {
          const { dataset } = event.target as HTMLElement;
          const disabled =
            dataset?.pliteEditor === 'true' ||
            readOnly ||
            dataset?.plateOpenContextMenu === 'false';

          if (disabled) {
            event.preventDefault();
            return;
          }

          const selectable = (event.target as HTMLElement).closest<HTMLElement>(
            '[data-plite-node="element"]'
          );
          const node = selectable
            ? editor.api.dom.resolvePliteNode(selectable)
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
        onFinalFocus={(e) => {
          e.preventDefault();
          editor.api.dom.focus();

          if (valueRef.current === 'askAI') {
            editor.plugin(AIChatPlugin).api.show();
          }

          valueRef.current = null;
        }}
      >
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => {
              valueRef.current = 'askAI';
            }}
          >
            Ask AI
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor.update.nodes.remove();
              editor.api.dom.focus();
            }}
          >
            Delete
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              editor.update((tx) => {
                tx.blocks.duplicate();
              });
            }}
          >
            Duplicate
            {/* <ContextMenuShortcut>⌘ + D</ContextMenuShortcut> */}
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Turn into</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                onClick={() => {
                  handleTurnInto(PLUGINS.paragraph);
                }}
              >
                Paragraph
              </ContextMenuItem>

              <ContextMenuItem
                onClick={() => {
                  handleTurnInto('heading-1');
                }}
              >
                Heading 1
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  handleTurnInto('heading-2');
                }}
              >
                Heading 2
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  handleTurnInto('heading-3');
                }}
              >
                Heading 3
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  handleTurnInto(PLUGINS.blockquote);
                }}
              >
                Blockquote
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  handleTurnInto(PLUGINS.codeDrawing);
                }}
              >
                Code Drawing
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>

        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => {
              handleIndent(true);
            }}
          >
            Indent
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              handleIndent(false);
            }}
          >
            Outdent
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Align</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem
                onClick={() => {
                  handleAlign('left');
                }}
              >
                Left
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  handleAlign('center');
                }}
              >
                Center
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  handleAlign('right');
                }}
              >
                Right
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const BlockMenuKit = [
  definePlatePlugin('blockMenuUi', {
    render: { aboveEditable: BlockContextMenu },
  }),
];
