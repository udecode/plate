import { DefaultAuthoredPlugin } from '../../../authored';
import { BaseSuggestionPlugin } from '../../../features/suggestion/BaseSuggestionPlugin';
import { observeSuggestionChanges } from '../../../features/suggestion/suggestion.internal';
import type { InternalPluginDefinitionOf } from '../../../lib/plugin/pluginDefinitionLookup.internal';
import { toReactPlugin, type PluginConfiguration } from '../../core';
import type { InternalReactPluginAdapterResult } from '../../plugin/toReactPlugin';
import {
  getSuggestionViewStore,
  SuggestionViewProvider,
} from './suggestion-view.internal';

const findSuggestionElement = (target: EventTarget | null) => {
  const element =
    target instanceof globalThis.Element
      ? target
      : target instanceof globalThis.Node
        ? target.parentElement
        : null;

  return element?.closest('[data-editor-authored-change]') ?? null;
};

type SuggestionPluginDefinition = InternalPluginDefinitionOf<
  typeof BaseSuggestionPlugin
>;
type SuggestionReactAdapter = Readonly<{
  decorate: NonNullable<
    PluginConfiguration<SuggestionPluginDefinition>['decorate']
  >;
  on: NonNullable<PluginConfiguration<SuggestionPluginDefinition>['on']>;
  slots: NonNullable<PluginConfiguration<SuggestionPluginDefinition>['slots']>;
}>;

const suggestionReactAdapter: SuggestionReactAdapter = {
  decorate: {
    attributes: ({ decoration, editor }) => {
      const id = decoration.attributes['data-editor-authored-change'];
      const activeId = getSuggestionViewStore(editor)?.getSnapshot().activeId;

      return {
        'data-editor-suggestion-active':
          typeof id === 'string' && id === activeId ? '' : undefined,
      };
    },
    observe: ({ editor, refresh }) => {
      const store = getSuggestionViewStore(editor);
      const stopChanges = observeSuggestionChanges(
        editor,
        refresh,
        (publication) => {
          const activeId = store?.getSnapshot().activeId;
          if (!activeId || !publication.changeIds.includes(activeId)) return;
          const change = editor
            .plugin(DefaultAuthoredPlugin)
            .read.change(activeId);
          if (
            !change ||
            (change.status !== 'pending' && change.status !== 'conflicted')
          ) {
            store.setActiveId(null);
          }
        }
      );
      const stopActive = store?.subscribeRefresh((nodeKeys) =>
        refresh({ nodeKeys })
      );

      return () => {
        stopActive?.();
        stopChanges();
      };
    },
  },
  on: {
    click: ({ editor, event }) => {
      const store = getSuggestionViewStore(editor);
      const element = findSuggestionElement(event.target);

      if (!element || !event.currentTarget.contains(element)) {
        store?.setActiveId(null);
        return;
      }
      store?.setActiveId(element.getAttribute('data-editor-authored-change'));
    },
  },
  slots: { wrapRoot: SuggestionViewProvider },
};

/** React interaction for the exact mounted suggestion view. */
export const SuggestionPlugin: InternalReactPluginAdapterResult<
  typeof BaseSuggestionPlugin,
  SuggestionReactAdapter
> = toReactPlugin(BaseSuggestionPlugin, suggestionReactAdapter);
