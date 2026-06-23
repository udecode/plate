import type { SlateEditor } from 'platejs';

import type { BaseSuggestionConfig } from '../BaseSuggestionPlugin';

export const getSuggestionApi = (
  editor: SlateEditor
): BaseSuggestionConfig['api']['suggestion'] =>
  (editor.api as SlateEditor['api'] & BaseSuggestionConfig['api']).suggestion;
