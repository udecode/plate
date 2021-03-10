import { useRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin, useEditorType } from '@udecode/slate-plugins-core';
import { ELEMENT_MENTION } from './defaults';
import { useDeserializeMention } from './useDeserializeMention';

/**
 * Enables support for autocompleting @mentions and #tags.
 * When typing a configurable marker, such as @ or #, a select
 * component appears with autocompleted suggestions.
 */
export const MentionPlugin = (): SlatePlugin => {
  const type = useEditorType(ELEMENT_MENTION);

  return {
    elementKeys: ELEMENT_MENTION,
    renderElement: useRenderElement(ELEMENT_MENTION),
    deserialize: useDeserializeMention(),
    inlineTypes: [type],
    voidTypes: [type],
  };
};
