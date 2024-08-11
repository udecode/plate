import type React from 'react';

import { type TReactEditor, isComposing } from '@udecode/slate-react';

import {
  Hotkeys as VanillaHotkeys,
  createHotkey,
} from '../../lib/utils/hotkeys';

const createComposing =
  (key: string) =>
  (
    editor: TReactEditor,
    event: React.KeyboardEvent,
    {
      composing,
    }: {
      /** Ignore the event if composing. */
      composing?: boolean;
    } = {}
  ) => {
    if (!createHotkey(key)(event)) return false;
    if (!!composing !== isComposing(editor)) return false;

    return true;
  };

export const Hotkeys = {
  ...VanillaHotkeys,
  isTab: createComposing('tab'),
  isUntab: createComposing('untab'),
};
