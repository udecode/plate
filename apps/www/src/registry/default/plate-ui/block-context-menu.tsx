import { useCallback, useState } from 'react';

import { AIChatPlugin } from '@udecode/plate-ai/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { unsetNodes } from '@udecode/plate-common';
import {
  ParagraphPlugin,
  focusEditor,
  useEditorPlugin,
} from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import {
  BLOCK_CONTEXT_MENU_ID,
  BlockMenuPlugin,
  BlockSelectionPlugin,
} from '@udecode/plate-selection/react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu';

type Value = 'askAI' | null;

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const { api, editor } = useEditorPlugin(BlockMenuPlugin);
  const [value, setValue] = useState<Value>(null);

  const handleTurnInto = useCallback(
    (type: string) => {
      editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes()
        .forEach(([node, path]) => {
          if (node[IndentListPlugin.key]) {
            unsetNodes(editor, [IndentListPlugin.key, 'indent'], { at: path });
          }

          editor.tf.toggle.block({ type }, { at: path });
        });
    },
    [editor]
  );

  const handleAlign = useCallback(
    (align: 'center' | 'left' | 'right') => {
      editor
        .getTransforms(BlockSelectionPlugin)
        .blockSelection.setNodes({ align });
    },
    [editor]
  );

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger
        onContextMenu={(event) => {
          const dataset = (event.target as HTMLElement).dataset;

          const disabled = dataset?.slateEditor === 'true';

          if (disabled) return event.preventDefault();

          api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, {
            x: event.clientX,
            y: event.clientY,
          });
        }}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-64"
        onCloseAutoFocus={(e) => {
          e.preventDefault();

          if (value === 'askAI') {
            editor.getApi(AIChatPlugin).aiChat.show();
          }

          setValue(null);
        }}
      >
        <ContextMenuItem
          onClick={() => {
            setValue('askAI');
          }}
        >
          Ask AI
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            editor
              .getTransforms(BlockSelectionPlugin)
              .blockSelection.removeNodes();
            focusEditor(editor);
          }}
        >
          Delete
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            editor
              .getTransforms(BlockSelectionPlugin)
              .blockSelection.duplicate(
                editor.getApi(BlockSelectionPlugin).blockSelection.getNodes()
              );
          }}
        >
          Duplicate
          <ContextMenuShortcut>⌘ + D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Turn into</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              onClick={() => handleTurnInto(ParagraphPlugin.key)}
            >
              Paragraph
            </ContextMenuItem>

            <ContextMenuItem onClick={() => handleTurnInto(HEADING_KEYS.h1)}>
              Heading 1
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleTurnInto(HEADING_KEYS.h2)}>
              Heading 2
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleTurnInto(HEADING_KEYS.h3)}>
              Heading 3
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => handleTurnInto(BlockquotePlugin.key)}
            >
              Blockquote
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() =>
            editor
              .getTransforms(BlockSelectionPlugin)
              .blockSelection.setIndent(1)
          }
        >
          Indent
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() =>
            editor
              .getTransforms(BlockSelectionPlugin)
              .blockSelection.setIndent(-1)
          }
        >
          Outdent
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Align</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem onClick={() => handleAlign('left')}>
              Left
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAlign('center')}>
              Center
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAlign('right')}>
              Right
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
