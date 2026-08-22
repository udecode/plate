'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import {
  BLOCK_CONTEXT_MENU_ID,
  BlockMenuPlugin,
  BlockSelectionPlugin,
} from '@platejs/selection/react';
import { PLUGINS } from 'platejs';
import {
  useEditor,
  useEditorPlugin,
  useEditorReadOnly,
  usePluginStore,
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
} from '@/components/ui/context-menu';
import { applyBlockAction } from '@/registry/components/editor/transforms';

import { BlockSelectionKit } from './block-selection';

type Value = 'askAI' | null;

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const editor = useEditor();
  const { api } = useEditorPlugin(BlockMenuPlugin);
  const valueRef = React.useRef<Value>(null);
  const [isTouch, setIsTouch] = React.useState(false);
  const readOnly = useEditorReadOnly();
  const openKey = usePluginStore(BlockMenuPlugin, 'openKey');
  const isOpen = openKey === BLOCK_CONTEXT_MENU_ID;

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
      editor
        .plugin(BlockSelectionPlugin)
        .read.getNodes()
        .forEach(([, path]) => {
          applyBlockAction(editor, action, { at: path });
        });
    },
    [editor]
  );

  const handleAlign = React.useCallback(
    (align: 'center' | 'left' | 'right') => {
      editor.plugin(BlockSelectionPlugin).update.setNodes({ textAlign: align });
    },
    [editor]
  );

  if (isTouch) {
    return children;
  }

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (!open) {
          api.hide();
        }
      }}
      modal={false}
    >
      <ContextMenuTrigger
        asChild
        onContextMenu={(event) => {
          const { dataset } = event.target as HTMLElement;
          const disabled =
            dataset?.slateEditor === 'true' ||
            readOnly ||
            dataset?.plateOpenContextMenu === 'false';

          if (disabled) {
            event.preventDefault();
            return;
          }

          setTimeout(() => {
            api.show(BLOCK_CONTEXT_MENU_ID, {
              x: event.clientX,
              y: event.clientY,
            });
          }, 0);
        }}
      >
        <div className="w-full">{children}</div>
      </ContextMenuTrigger>
      {isOpen && (
        <ContextMenuContent
          className="w-64"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            editor.plugin(BlockSelectionPlugin).api.focus();

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
                editor.plugin(BlockSelectionPlugin).update.removeNodes();
                editor.api.dom.focus();
              }}
            >
              Delete
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                editor.plugin(BlockSelectionPlugin).update.duplicate();
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
                editor.plugin(BlockSelectionPlugin).update.setIndent(1);
              }}
            >
              Indent
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                editor.plugin(BlockSelectionPlugin).update.setIndent(-1);
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
      )}
    </ContextMenu>
  );
}

export const BlockMenuKit = [
  ...BlockSelectionKit,
  BlockMenuPlugin.configure({
    render: { aboveEditable: BlockContextMenu },
  }),
];
