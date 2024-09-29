import { Icons } from '@/components/icons';

import type { Action } from './menu';

/** Common */
const ACTION_CHINESE = 'action_chinese';
const ACTION_ENGLISH = 'action_english';
const ACTION_KOREAN = 'action_korean';

const languages = [
  { label: 'English', value: ACTION_ENGLISH },
  { label: 'Chinese', value: ACTION_CHINESE },
  { label: 'Korean', value: ACTION_KOREAN },
] satisfies Action[];

/** DefaultItems */

export const ACTION_CONTINUE_WRITE = 'action_continue_write';

export const ACTION_EXPLAIN = 'action_explain';

export const ACTION_SUMMARIZE = 'action_summarize';

export const GROUP_LANGUAGES = 'group_languages';

export const GROUP_ALIGN = 'group_align';

export const ACTION_CAPTION = 'action_cation';

export const DefaultActions = {
  Summarize: {
    icon: <Icons.summarize />,
    label: 'Summarize',
    value: ACTION_SUMMARIZE,
  },
  continueWrite: {
    icon: <Icons.continueWrite />,
    label: 'Continue writing',
    value: ACTION_CONTINUE_WRITE,
  },
  explain: {
    icon: <Icons.explain />,
    label: 'Explain this',
    value: ACTION_EXPLAIN,
  },
  translate: {
    group: GROUP_LANGUAGES,
    icon: <Icons.translate />,
    items: languages,
    label: 'Translate',
  },
} satisfies Record<string, Action>;

export const defaultValues = {
  // [GROUP_LANGUAGES]: ACTION_ENGLISH,
};

/** SuggestionItems */

export const ACTION_SUGGESTION_CLOSE = 'action_close';

export const ACTION_SUGGESTION_CONTINUE_WRITE =
  'action_suggestion_continue_write';

export const ACTION_SUGGESTION_DONE = 'action_done';

export const ACTION_SUGGESTION_MAKE_LONGER = 'action_longer';

export const ACTION_SUGGESTION_TRY_AGAIN = 'action_try_again';

export const DefaultSuggestionActions = {
  close: {
    icon: <Icons.close />,
    label: 'Close',
    value: ACTION_SUGGESTION_CLOSE,
  },
  continueWrite: {
    icon: <Icons.continueWrite />,
    label: 'Continue writing',
    value: ACTION_SUGGESTION_CONTINUE_WRITE,
  },
  done: {
    icon: <Icons.done />,
    label: 'Done',
    value: ACTION_SUGGESTION_DONE,
  },
  makeLonger: {
    icon: <Icons.makeLonger />,
    label: 'Make longer',
    value: ACTION_SUGGESTION_MAKE_LONGER,
  },
  tryAgain: {
    icon: <Icons.tryAgain />,
    label: 'Try again',
    value: ACTION_SUGGESTION_TRY_AGAIN,
  },
};

/** SelectionItems */

export const ACTION_SELECTION_IMPROVE_WRITING = 'action_improve_writing';

export const ACTION_SELECTION_FIX_SPELLING = 'action_fix_spelling';

export const ACTION_SELECTION_MAKE_LONGER = 'action_selection_make_longer';

export const ACTION_SELECTION_MAKE_SHORTER = 'action_selection_make_shorter';

export const ACTION_SELECTION_SIMPLIFY_LANGUAGE = 'action_simplify_language';

export const GROUP_SELECTION_LANGUAGES = 'group_selection_languages';

export const SelectionActions = {
  fixSpell: {
    icon: <Icons.check />,
    label: 'Fix spelling & grammar',
    value: ACTION_SELECTION_FIX_SPELLING,
  },
  improveWriting: {
    icon: <Icons.improve />,
    label: 'Improve writing',
    value: ACTION_SELECTION_IMPROVE_WRITING,
  },
  makeLonger: {
    icon: <Icons.makeLonger />,
    label: 'Make longer',
    value: ACTION_SELECTION_MAKE_LONGER,
  },
  makeShorter: {
    icon: <Icons.makeShorter />,
    label: 'Make shorter',
    value: ACTION_SELECTION_MAKE_SHORTER,
  },
  simplifyLanguage: {
    icon: <Icons.simplify />,
    label: 'Simplify language',
    value: ACTION_SELECTION_SIMPLIFY_LANGUAGE,
  },
  translate: {
    group: GROUP_SELECTION_LANGUAGES,
    icon: <Icons.translate />,
    items: languages,
    label: 'Translate',
  },
};

/** SelectionSuggestionItems */
export const ACTION_SELECTION_SUGGESTION_REPLACE =
  'action_selection_suggestion_replace';

export const ACTION_SELECTION_SUGGESTION_INSERT_BELOW =
  'action_selection_suggestion_below';

export const ACTION_SELECTION_SUGGESTION_MAKE_LONGER =
  'action_selection_suggestion_make_longer';

export const ACTION_SELECTION_SUGGESTION_DONE =
  'action_selection_suggestion_done';

export const ACTION_SELECTION_SUGGESTION_TRY_AGAIN =
  'action_selection_suggestion_try_again';

export const ACTION_SELECTION_SUGGESTION_CONTINUE_WRITE =
  'action_selection_suggestion_continue_write';

export const SelectionSuggestionActions = {
  continueWrite: {
    icon: <Icons.continueWrite />,
    label: 'Continue writing',
    value: ACTION_SELECTION_SUGGESTION_CONTINUE_WRITE,
  },
  done: {
    icon: <Icons.done />,
    label: 'Done',
    value: ACTION_SELECTION_SUGGESTION_DONE,
  },
  insertBelow: {
    icon: <Icons.add />,
    label: 'Insert below',
    value: ACTION_SELECTION_SUGGESTION_INSERT_BELOW,
  },
  makeLonger: {
    icon: <Icons.makeLonger />,
    label: 'Make longer',
    value: ACTION_SELECTION_SUGGESTION_MAKE_LONGER,
  },
  replace: {
    icon: <Icons.check />,
    label: 'Replace selection',
    value: ACTION_SELECTION_SUGGESTION_REPLACE,
  },
  tryAgain: {
    icon: <Icons.tryAgain />,
    label: 'Try again',
    value: ACTION_SELECTION_SUGGESTION_TRY_AGAIN,
  },
};
