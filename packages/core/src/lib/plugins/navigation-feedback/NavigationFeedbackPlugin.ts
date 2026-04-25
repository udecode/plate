import { PathApi } from '@platejs/slate';

import { createTSlatePlugin } from '../../plugin';
import {
  clearNavigationFeedbackTarget,
  flashTarget,
  navigate,
  resolveNavigationFeedbackTarget,
} from './transforms';
import type { NavigationFeedbackConfig } from './types';
import { NAVIGATION_FEEDBACK_KEY, NavigationFeedbackPluginKey } from './types';

export const NavigationFeedbackPlugin =
  createTSlatePlugin<NavigationFeedbackConfig>({
    key: NAVIGATION_FEEDBACK_KEY,
    options: {
      activeTarget: null,
      duration: 1600,
    },
  })
    .extendEditorApi<NavigationFeedbackConfig['api']>(({ editor }) => {
      const getActiveTarget = () => {
        const storedTarget = editor.getOption(
          NavigationFeedbackPluginKey,
          'activeTarget'
        );
        const activeTarget = resolveNavigationFeedbackTarget(storedTarget);

        if (!activeTarget && storedTarget) {
          clearNavigationFeedbackTarget(editor);

          return null;
        }

        return activeTarget;
      };

      return {
        navigation: {
          activeTarget: getActiveTarget,
          clear: () => clearNavigationFeedbackTarget(editor),
          isTarget: (path) => {
            const activeTarget = getActiveTarget();

            return !!activeTarget && PathApi.equals(activeTarget.path, path);
          },
        },
      };
    })
    .extendEditorTransforms<NavigationFeedbackConfig['transforms']>(
      ({ editor }) => ({
        navigation: {
          clear: () => clearNavigationFeedbackTarget(editor),
          flashTarget: (options) => flashTarget(editor, options),
          navigate: (options) => navigate(editor, options),
        },
      })
    );
