import type { BasePlateEditor } from 'platejs';

import type { BaseSuggestionConfig } from '../BaseSuggestionPlugin';

export const getSuggestionApi = (
  editor: BasePlateEditor
): BaseSuggestionConfig['api']['suggestion'] =>
  (editor.api as BasePlateEditor['api'] & BaseSuggestionConfig['api'])
    .suggestion;
