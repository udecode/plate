import { BaseSuggestionPlugin } from '../../../features/suggestion/BaseSuggestionPlugin';
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
  on: NonNullable<PluginConfiguration<SuggestionPluginDefinition>['on']>;
  slots: NonNullable<PluginConfiguration<SuggestionPluginDefinition>['slots']>;
}>;

const suggestionReactAdapter: SuggestionReactAdapter = {
  on: {
    click: ({ editor, event }) => {
      const store = getSuggestionViewStore(editor);
      const element = findSuggestionElement(event.target);

      if (!element || !event.currentTarget.contains(element)) {
        store?.setActiveId(null);
        return;
      }
      store?.setActiveId(
        element.getAttribute('data-editor-authored-groups')?.split(' ')[0] ||
          null
      );
    },
  },
  slots: { wrapRoot: SuggestionViewProvider },
};

/** React interaction for the exact mounted suggestion view. */
export const SuggestionPlugin: InternalReactPluginAdapterResult<
  typeof BaseSuggestionPlugin,
  SuggestionReactAdapter
> = toReactPlugin(BaseSuggestionPlugin, suggestionReactAdapter);
