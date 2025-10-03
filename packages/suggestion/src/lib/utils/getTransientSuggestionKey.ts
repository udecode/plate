import { KEYS } from 'platejs';

// do not start with suggestion_ to avoid conflict with other suggestion keys
export const getTransientSuggestionKey = () => `${KEYS.suggestion}Transient`;
