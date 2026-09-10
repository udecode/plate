'use client';

import { AIChatPlugin, AIPlugin } from 'platejs/ai/react';
import {
  PlateText,
  usePluginStore,
  useClaimEditableDOMCommit,
  type PlateTextProps,
  type RenderNodeWrapper,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { AILoadingBar, AIMenu } from '@/registry/components/editor/ai-menu';

import { EditorStatic } from './editor-static';
import { BaseEditorRenderers } from './plugins-static';
import { AIChatTransportPlugin, useEditorChat } from './use-chat';

export function AILeaf(props: PlateTextProps<typeof AIPlugin>) {
  return (
    <PlateText
      className={cn(
        'border-b-2 border-b-purple-100 bg-purple-50 text-purple-800',
        'transition-all duration-200 ease-in-out'
      )}
      {...props}
    />
  );
}

const targetIndices = new WeakMap<readonly string[], Map<string, number>>();
const targetIndex = (targets: readonly string[], key: string) => {
  let indices = targetIndices.get(targets);
  if (!indices) {
    indices = new Map(targets.map((target, index) => [target, index]));
    targetIndices.set(targets, indices);
  }
  return indices.get(key) ?? -1;
};

const AIDraftPreview = React.memo(
  ({
    editor,
    preview,
    index,
    targetCount,
  }: {
    editor: import('platejs/react').Editor;
    preview: import('platejs').Value;
    index: number;
    targetCount: number;
  }) => {
    const nodes =
      index === targetCount - 1
        ? preview.slice(index)
        : preview.slice(index, index + 1);
    return (
      <EditorStatic
        editor={editor}
        value={{ children: nodes }}
        renderers={BaseEditorRenderers}
        variant="ai"
      />
    );
  }
);
AIDraftPreview.displayName = 'AIDraftPreview';

/** The canonical block stays mounted for DOM ownership; the draft is separate. */
function AIDraft({
  children,
  editor,
  element,
}: {
  children: React.ReactNode;
  editor: import('platejs/react').Editor;
  element: import('platejs').Element;
}) {
  useClaimEditableDOMCommit();
  const key = editor.key(element);
  const operation = usePluginStore(AIChatPlugin, (state) =>
    state.operation && targetIndex(state.operation.targets, key) >= 0
      ? state.operation
      : null
  );
  const mode = usePluginStore(AIChatPlugin, 'mode');
  const toolName = usePluginStore(AIChatPlugin, 'toolName');
  const index = operation ? targetIndex(operation.targets, key) : -1;
  const draftRef = React.useRef<HTMLDivElement>(null);
  const follows = React.useRef(true);
  const scrollParents = React.useRef<HTMLElement[]>([]);
  const viewport = React.useCallback(() => {
    let top = 0;
    let bottom = window.innerHeight;
    for (const parent of scrollParents.current) {
      const bounds = parent.getBoundingClientRect();
      top = Math.max(top, bounds.top);
      bottom = Math.min(bottom, bounds.bottom);
    }
    return { top, bottom };
  }, []);
  const preview = operation?.preview;
  const targetCount = operation?.targets.length ?? 0;
  const followsTarget = !!operation && index === targetCount - 1;
  React.useLayoutEffect(() => {
    if (!followsTarget) return undefined;
    const original = editor.api.dom.resolveDOMNode(element);
    scrollParents.current = [];
    let parent = original?.parentElement;
    while (parent) {
      if (/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowY)) {
        scrollParents.current.push(parent);
      }
      parent = parent.parentElement;
    }
    const bounds = viewport();
    follows.current =
      !!original &&
      original.getBoundingClientRect().bottom >= bounds.top &&
      original.getBoundingClientRect().bottom <= bounds.bottom + 80;
    const updateFollow = (event: Event) => {
      if (
        event.target !== document &&
        event.target !== window &&
        !scrollParents.current.includes(event.target as HTMLElement)
      ) {
        return;
      }
      const draft = draftRef.current;
      if (draft) {
        const visible = viewport();
        const { bottom } = draft.getBoundingClientRect();
        follows.current =
          bottom >= visible.top && bottom <= visible.bottom + 80;
      }
    };
    window.addEventListener('scroll', updateFollow, {
      capture: true,
      passive: true,
    });
    return () => window.removeEventListener('scroll', updateFollow, true);
  }, [editor, element, followsTarget, operation?.id, viewport]);
  React.useLayoutEffect(() => {
    if (!preview || index !== targetCount - 1) return;
    const draft = draftRef.current;
    if (
      draft &&
      follows.current &&
      draft.getBoundingClientRect().bottom > viewport().bottom - 40
    ) {
      draft.scrollIntoView({ block: 'end' });
    }
  }, [index, preview, targetCount, viewport]);
  if (
    !operation ||
    index < 0 ||
    operation.preview.length === 0 ||
    (mode === 'chat' && toolName === 'generate')
  ) {
    return children;
  }
  const replaces =
    mode === 'chat' ||
    toolName === 'edit' ||
    toolName === 'comment' ||
    editor.read.nodes.isEmpty(element);
  return (
    <div data-ai-target>
      <div style={replaces ? { display: 'none' } : undefined}>{children}</div>
      <div
        contentEditable={false}
        data-ai-draft
        ref={draftRef}
        className="relative rounded-sm bg-purple-50/40"
      >
        <AIDraftPreview
          editor={editor}
          preview={operation.preview}
          index={index}
          targetCount={targetCount}
        />
      </div>
    </div>
  );
}

const useAIAboveNodes: RenderNodeWrapper<typeof AIChatTransportPlugin> = ({
  editor,
  element,
}) => {
  const key = editor.key(element);
  const isTarget = usePluginStore(
    AIChatPlugin,
    (state) =>
      !!state.operation && targetIndex(state.operation.targets, key) >= 0
  );
  if (!isTarget) return;
  return function AITarget({ children }) {
    return (
      <AIDraft editor={editor} element={element}>
        {children}
      </AIDraft>
    );
  };
};

export const aiChatPlugin = AIChatTransportPlugin.extend({
  render: {
    aboveNodes: useAIAboveNodes,
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
  },
  shortcuts: { show: { keys: 'mod+j' } },
  useHooks: () => {
    useEditorChat();
  },
});

export const AIKit = [AIPlugin.configure({ component: AILeaf }), aiChatPlugin];
