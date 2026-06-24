import type { UseChatHelpers } from '@ai-sdk/react';
import type { TriggerComboboxPluginOptions } from '@platejs/combobox';
import type { Element, NodeEntry, Path, Range, Text } from '@platejs/plite';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { ElementApi } from '@platejs/plite';
import {
  type OmitFirst,
  type PluginConfig,
  type BasePlateEditor,
  type TIdElement,
  bindFirst,
  getPluginType,
  KEYS,
} from 'platejs';
import { createTPlatePlugin } from 'platejs/react';

import type { AIBatch } from '../../lib';
import { undoAI } from '../../lib/transforms';
import { getEditorHistory } from '../../lib/internal/history';
import type { AIMode, AIToolName } from '../../lib/types';
import type { ChatMessage } from './internal/types';
import type { AIChatPlateEditor } from './internal/editorTypes';

import { removeAnchorAIChat } from './transforms';
import { acceptAIChat } from './transforms/acceptAIChat';
import { insertBelowAIChat } from './transforms/insertBelowAIChat';
import type { RemoveAnchorAIChatOptions } from './transforms/removeAnchorAIChat';
import { replaceSelectionAIChat } from './transforms/replaceSelectionAIChat';
import { resetAIChat } from './utils/resetAIChat';
import { submitAIChat } from './utils/submitAIChat';
import { createAIChatExtension } from './withAIChat';

type AIChatNodeOptions = NonNullable<
  Parameters<BasePlateEditor['api']['node']>[0]
> & {
  anchor?: boolean;
  streaming?: boolean;
};

type AIChatTransportOptions = {
  api?: string;
  body?: Record<string, unknown>;
};

export type AIChatPluginConfig = PluginConfig<
  'aiChat',
  {
    _blockChunks: string;
    _blockPath: Path | null;
    /** @private Using For streamInsertChunk */
    _mdxName: string | null;
    _replaceIds: string[];
    /** @private The Editor used to generate the AI response. */
    aiEditor: BasePlateEditor | null;
    chat: UseChatHelpers<ChatMessage>;
    chatOptions: AIChatTransportOptions;
    chatNodes: TIdElement[];
    chatSelection: Range | null;
    /** @deprecated Use api.aiChat.node({streaming:true}) instead */
    experimental_lastTextId: string | null;
    /**
     * Specifies how the assistant message is handled:
     *
     * - 'insert': Directly inserts content into the editor without preview.
     * - 'chat': Initiates an interactive session to review and refine content
     *   before insertion.
     */
    mode: AIMode;
    open: boolean;
    /** Whether the AI response is currently streaming. Cursor mode only. */
    streaming: boolean;
    toolName: AIToolName;
  } & TriggerComboboxPluginOptions,
  {
    aiChat: {
      reset: OmitFirst<typeof resetAIChat>;
      submit: OmitFirst<typeof submitAIChat>;
      hide: (options?: { focus?: boolean; undo?: boolean }) => void;
      node: (
        options?: AIChatNodeOptions
      ) => NodeEntry<Element | Text> | undefined;
      reload: () => void;
      show: () => void;
      stop: () => void;
    };
  },
  {},
  {},
  {
    aiChat: {
      accept: OmitFirst<typeof acceptAIChat>;
      insertBelow: OmitFirst<typeof insertBelowAIChat>;
      replaceSelection: OmitFirst<typeof replaceSelectionAIChat>;
      removeAnchor: (options?: RemoveAnchorAIChatOptions) => void;
    };
  }
>;

export const AIChatPlugin = createTPlatePlugin<AIChatPluginConfig>({
  key: KEYS.aiChat,
  dependencies: ['ai'],
  node: {
    isElement: true,
  },
  options: {
    _blockChunks: '',
    _blockPath: null,
    _mdxName: null,
    _replaceIds: [],
    aiEditor: null,
    chat: { messages: [] } as unknown as UseChatHelpers<ChatMessage>,
    chatOptions: {},
    chatNodes: [],
    chatSelection: null,
    experimental_lastTextId: null,
    mode: 'insert',
    open: false,
    streaming: false,
    toolName: null,
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
  },
})
  .extend((ctx) => ({
    editorExtensions: [createAIChatExtension(ctx)],
  }))
  .extendApi<
    Pick<
      AIChatPluginConfig['api']['aiChat'],
      'node' | 'reset' | 'stop' | 'submit'
    >
  >(({ editor, getOption, getOptions, setOption, type }) => {
    const aiEditor = editor as AIChatPlateEditor;

    return {
      reset: bindFirst(resetAIChat, editor),
      submit: bindFirst(submitAIChat, aiEditor),
      node: (options = {}) => {
        const { anchor = false, streaming = false, ...rest } = options;

        if (anchor) {
          return editor.api.node({
            at: [],
            match: (n: unknown) => ElementApi.isElement(n) && n.type === type,
            ...rest,
          });
        }

        if (streaming) {
          if (!getOption('streaming')) return;

          const path = getOption('_blockPath');
          if (!path) return;

          return editor.api.node({
            at: path,
            mode: 'lowest',
            reverse: true,
            match: (t: unknown) =>
              !!(t as Record<string, unknown>)[getPluginType(editor, KEYS.ai)],
            ...rest,
          });
        }

        return editor.api.node({
          match: (n: unknown) =>
            Boolean(
              (n as Record<string, unknown>)[getPluginType(editor, KEYS.ai)]
            ),
          ...rest,
        });
      },
      reload: () => {
        const { chat, chatNodes, chatSelection } = getOptions();

        undoAI(editor);

        if (chatSelection) {
          editor.update((tx) => {
            tx.selection.set(chatSelection);
          });
        } else {
          aiEditor.api.blockSelection.set(
            chatNodes.map((node) => node.id as string)
          );
        }

        const blocks = aiEditor.api.blockSelection.getNodes();

        const selection =
          blocks.length > 0 ? editor.api.nodesRange(blocks) : editor.selection;

        const ctx = {
          children: editor.children,
          selection: selection ?? null,
          toolName: getOption('toolName'),
        };

        void chat.regenerate?.({
          body: {
            ctx,
          },
        });
      },
      stop: () => {
        setOption('streaming', false);
        setOption('_blockChunks', '');
        setOption('_blockPath', null);
        setOption('_mdxName', null);
        getOptions().chat.stop?.();
      },
    };
  })
  .extendApi(({ api, editor, getOptions, setOption }) => ({
    hide: ({
      focus = true,
      undo = true,
    }: {
      focus?: boolean;
      undo?: boolean;
    } = {}) => {
      api.aiChat.reset({ undo });

      setOption('open', false);

      if (focus) {
        if (editor.getOption(BlockSelectionPlugin, 'isSelectingSome')) {
          (editor as AIChatPlateEditor).api.blockSelection.focus();
        } else {
          editor.api.dom.focus();
        }
      }

      const lastBatch = getEditorHistory(editor).undos.at(-1) as AIBatch;

      if (lastBatch?.ai) {
        lastBatch.ai = undefined;
      }

      editor.update<AIChatPluginConfig['tx']>((tx) => tx.aiChat.removeAnchor());
    },
    show: () => {
      api.aiChat.reset();

      setOption('toolName', null);

      getOptions().chat.setMessages?.([]);

      setOption('open', true);
    },
  }))
  .extendTxGroup('aiChat', ({ editor }) => {
    const aiEditor = editor as AIChatPlateEditor;

    return () => ({
      accept: bindFirst(acceptAIChat, aiEditor),
      insertBelow: bindFirst(insertBelowAIChat, aiEditor),
      removeAnchor: bindFirst(removeAnchorAIChat, editor),
      replaceSelection: bindFirst(replaceSelectionAIChat, aiEditor),
    });
  });
