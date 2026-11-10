import { BaseSuggestionPlugin } from '../../../features/suggestion/BaseSuggestionPlugin';
import type { InternalPluginDefinitionOf } from '../../../lib/plugin/pluginDefinitionLookup.internal';
import { toReactPlugin, type PluginConfiguration } from '../../core';
import type { InternalReactPluginAdapterResult } from '../../plugin/toReactPlugin';
import { createAnnotationPointerHandlers } from '../../utils/annotationPointer.internal';
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

const suggestionIdAt = (event: {
  currentTarget: Element;
  target: EventTarget | null;
}) => {
  const element = findSuggestionElement(event.target);

  if (!element || !event.currentTarget.contains(element)) return null;

  return (
    element.getAttribute('data-editor-authored-groups')?.split(' ')[0] || null
  );
};

type SuggestionPluginDefinition = InternalPluginDefinitionOf<
  typeof BaseSuggestionPlugin
>;
type SuggestionReactAdapter = Readonly<{
  on: NonNullable<PluginConfiguration<SuggestionPluginDefinition>['on']>;
  slots: NonNullable<PluginConfiguration<SuggestionPluginDefinition>['slots']>;
}>;

const suggestionReactAdapter: SuggestionReactAdapter = {
  on: createAnnotationPointerHandlers({
    clear: (editor) => getSuggestionViewStore(editor)?.setActiveId(null),
    keyAt: suggestionIdAt,
    select: ({ editor, event }) =>
      getSuggestionViewStore(editor)?.setActiveId(suggestionIdAt(event)),
  }),
  slots: { wrapRoot: SuggestionViewProvider },
};

/** React interaction for the exact mounted suggestion view. */
export const SuggestionPlugin: InternalReactPluginAdapterResult<
  typeof BaseSuggestionPlugin,
  SuggestionReactAdapter
> = toReactPlugin(BaseSuggestionPlugin, suggestionReactAdapter);
