import type { CollapseWhiteSpaceState } from './types';

export const upsertInlineFormattingContext = (
  state: CollapseWhiteSpaceState
) => {
  if (state.inlineFormattingContext) {
    state.inlineFormattingContext.atStart = false;
  } else {
    state.inlineFormattingContext = {
      atStart: true,
      lastHasTrailingWhiteSpace: false,
    };
  }
};

export const endInlineFormattingContext = (state: CollapseWhiteSpaceState) => {
  state.inlineFormattingContext = null;
};
