import { mySuggestionsProviderFile } from './code-MySuggestionsProvider';
import { plateSuggestionToolbarDropdownFile } from './code-PlateSuggestionToolbarDropdown';
import { constantsFile } from './code-constants';

export const suggestionFiles = {
  ...mySuggestionsProviderFile,
  ...plateSuggestionToolbarDropdownFile,
  ...constantsFile,
};
