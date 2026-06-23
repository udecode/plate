import { PathApi } from '@platejs/plite';

import { withLegacyTransformOverride } from '../../../internal/plugin/withLegacyTransformOverride';
import { createEditorPlugin } from '../../plugin';
import {
  clearNavigationFeedbackTarget,
  flashTarget,
  navigate,
  resolveNavigationFeedbackTarget,
} from './transforms';
import type {
  NavigationFeedbackConfig,
  NavigationFlashTargetOptions,
  NavigationNavigateOptions,
} from './types';
import { NAVIGATION_FEEDBACK_KEY, NavigationFeedbackPluginKey } from './types';

export const NavigationFeedbackPlugin = withLegacyTransformOverride(
  createEditorPlugin<NavigationFeedbackConfig>({
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
    .extendTxGroup('navigation', ({ editor }) => () => ({
      clear: () => clearNavigationFeedbackTarget(editor),
      flashTarget: (options: NavigationFlashTargetOptions) =>
        flashTarget(editor, options),
      navigate: (options: NavigationNavigateOptions) =>
        navigate(editor, options),
    })),
  ({ editor }) => ({
    tf: {
      navigation: {
        clear: () => clearNavigationFeedbackTarget(editor),
        flashTarget: (options: NavigationFlashTargetOptions) =>
          flashTarget(editor, options),
        navigate: (options: NavigationNavigateOptions) =>
          navigate(editor, options),
      },
    },
  })
);
