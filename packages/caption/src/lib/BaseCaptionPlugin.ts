import { type PluginConfig, createBasePlugin } from '@platejs/core';
import type { Path } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  focusCaptionAfterArrowUpSelectionMove,
  focusCaptionFromCurrentBlock,
  markCaptionArrowUpSelectionMove,
} from './withCaption';

export type CaptionConfig = PluginConfig<
  'caption',
  {
    /** When defined, focus end of caption textarea with the same path. */
    focusEndPath: Path | null;
    /** When defined, focus start of caption textarea with the same path. */
    focusStartPath: Path | null;
    // isVisible?: (elementId: string) => boolean;
    query: {
      /** Plugin keys to enable caption. */
      allow: string[];
    };
    visibleId: string | null;
  },
  {},
  {},
  {
    isVisible?: (elementId: string) => boolean;
  }
>;

/** Enables support for caption. */
export const BaseCaptionPlugin = createBasePlugin<CaptionConfig>({
  key: KEYS.caption,
  options: {
    focusEndPath: null,
    focusStartPath: null,
    query: { allow: [] },
    visibleId: null,
  },
  shortcuts: {
    focusCaptionBackward: {
      keys: 'up',
      handler: ({ editor }) => markCaptionArrowUpSelectionMove(editor),
    },
    focusCaptionForward: {
      keys: 'down',
      handler: ({ editor }) => {
        const caption = editor.plugin<CaptionConfig>(KEYS.caption);

        return focusCaptionFromCurrentBlock(
          editor,
          caption.getOptions(),
          (path) => caption.setOption('focusEndPath', path)
        );
      },
    },
  },
})
  .extendSelectors<CaptionConfig['selectors']>(({ getOptions }) => ({
    isVisible: (elementId) => getOptions().visibleId === elementId,
  }))
  .extendExtension(({ editor, getOptions, setOption }) => ({
    operations: {
      apply({ operation, next }) {
        if (operation.type === 'set_selection') {
          focusCaptionAfterArrowUpSelectionMove(
            editor,
            getOptions(),
            operation,
            (path) => setOption('focusEndPath', path)
          );
        }

        next(operation);
      },
    },
  }));
