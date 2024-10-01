import type { ExtendConfig } from '@udecode/plate-core';
import type { AriakitTypes } from '@udecode/plate-menu';
import type { NodeEntry, Path } from 'slate';

import {
  type PlateEditor,
  toDOMNode,
  toTPlatePlugin,
} from '@udecode/plate-common/react';

import { type BaseAIPluginConfig, BaseAIPlugin } from '../../lib';
import { useAIHooks } from './useAIHook';

export const KEY_AI = 'ai';

export interface FetchAISuggestionProps {
  abortSignal: AbortController;
  prompt: string;
  system?: string;
}

interface ExposeOptions {
  createAIEditor: () => PlateEditor;
  scrollContainerSelector: string;
  fetchSuggestion?: (props: FetchAISuggestionProps) => Promise<ReadableStream>;
  trigger?: RegExp | string[] | string;

  triggerPreviousCharPattern?: RegExp;
}

export type AISelectors = {
  isOpen: (editorId: string) => boolean;
};

export type AIApi = {
  abort: () => void;
  clearLast: () => void;
  focusMenu: () => void;
  hide: () => void;
  setAnchorElement: (dom: HTMLElement) => void;
  show: (editorId: string, dom: HTMLElement, nodeEntry: NodeEntry) => void;
};

export type AIActionGroup = {
  group?: string;
  value?: string;
};

export type AIPluginConfig = ExtendConfig<
  BaseAIPluginConfig,
  {
    abortController: AbortController | null;
    action: AIActionGroup | null;
    aiEditor: PlateEditor | null;
    aiState: 'done' | 'generating' | 'idle' | 'requesting';
    anchorDom: HTMLElement | null;
    curNodeEntry: NodeEntry | null;
    initNodeEntry: NodeEntry | null;
    lastGenerate: string | null;
    lastPrompt: string | null;
    lastWorkPath: Path | null;
    menuType: 'selection' | 'space' | null;
    openEditorId: string | null;
    store: AriakitTypes.MenuStore | null;
  } & ExposeOptions &
    AIApi &
    AISelectors,
  {
    ai: AIApi;
  }
>;

export const AIPlugin = toTPlatePlugin<AIPluginConfig>(BaseAIPlugin, {
  options: {
    abortController: null,
    action: null,
    aiEditor: null,
    aiState: 'idle',
    anchorDom: null,
    curNodeEntry: null,
    initNodeEntry: null,
    lastGenerate: null,
    lastPrompt: null,
    lastWorkPath: null,
    menuType: null,
    openEditorId: null,
    store: null,
  },
})
  .extendOptions<AISelectors>(({ getOptions }) => ({
    isOpen: (editorId: string) => {
      const { openEditorId, store } = getOptions();
      const anchorElement = store?.getState().anchorElement;
      const isAnchor = !!anchorElement && document.contains(anchorElement);

      return !!editorId && openEditorId === editorId && isAnchor;
    },
  }))
  .extendApi<
    Required<Pick<AIApi, 'clearLast' | 'focusMenu' | 'setAnchorElement'>>
  >(({ getOptions, setOptions }) => ({
    clearLast: () => {
      setOptions({
        lastGenerate: null,
        lastPrompt: null,
        lastWorkPath: null,
      });
    },
    focusMenu: () => {
      const { store } = getOptions();

      setTimeout(() => {
        const searchInput = document.querySelector(
          '#__potion_ai_menu_searchRef'
        ) as HTMLInputElement;

        if (store) {
          store.setAutoFocusOnShow(true);
          store.setInitialFocus('first');
          searchInput?.focus();
        }
      }, 0);
    },
    setAnchorElement: (dom: HTMLElement) => {
      const { store } = getOptions();

      if (store) {
        store.setAnchorElement(dom);
      }
    },
  }))
  .extendApi<Required<Pick<AIApi, 'abort' | 'hide' | 'show'>>>(
    ({ api, getOptions, setOption }) => ({
      abort: () => {
        const { abortController } = getOptions();

        abortController?.abort();
        setOption('aiState', 'idle');
        setTimeout(() => {
          api.ai.focusMenu();
        }, 0);
      },
      hide: () => {
        setOption('openEditorId', null);
        getOptions().store?.setAnchorElement(null);
      },
      show: (editorId: string, dom: HTMLElement, nodeEntry: NodeEntry) => {
        const { store } = getOptions();

        setOption('openEditorId', editorId);
        api.ai.clearLast();
        setOption('initNodeEntry', nodeEntry);
        api.ai.setAnchorElement(dom);
        store?.show();
        api.ai.focusMenu();
      },
    })
  )
  .extend(({ api, getOptions, setOptions }) => ({
    options: {
      onOpenAI(editor, [node, path]) {
        // NOTE: toDOMNode is dependent on the React make it to an options if want to support other frame.
        const dom = toDOMNode(editor, node);

        if (!dom) return;

        const { scrollContainerSelector } = getOptions();

        // TODO popup animation
        if (scrollContainerSelector) {
          const scrollContainer = document.querySelector(
            scrollContainerSelector
          );

          if (!scrollContainer) return;

          // Make sure when popup in very bottom the menu within the viewport range.
          const rect = dom.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const distanceToBottom = windowHeight - rect.bottom;

          // 261 is height of the menu.
          if (distanceToBottom < 261) {
            // TODO: scroll animation
            scrollContainer.scrollTop += 261 - distanceToBottom;
          }
        }

        api.ai.show(editor.id, dom, [node, path]);
        setOptions({
          aiState: 'idle',
          menuType: 'space',
        });
      },
    },
    useHooks: useAIHooks,
  }));
