import { PathApi } from '@platejs/plite';

import { createPlatePlugin } from '../../plugin';
import { useEditorPluginOption } from '../../stores';
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

export const NavigationFeedbackPlugin =
  createPlatePlugin<NavigationFeedbackConfig>({
    key: NAVIGATION_FEEDBACK_KEY,
    inject: {
      isElement: true,
      nodeProps: {
        transformProps: ({ editor, element, path, props, text }) => {
          const storedTarget = useEditorPluginOption(
            editor,
            NavigationFeedbackPlugin,
            'activeTarget'
          );
          const activeTarget = resolveNavigationFeedbackTarget(storedTarget);
          const target = element ?? text;

          if (!activeTarget || !target) return props;

          if (!path || !PathApi.equals(activeTarget.path, path)) return props;

          return {
            ...props,
            'data-nav-cycle': String(activeTarget.cycle),
            'data-nav-highlight': activeTarget.variant,
            'data-nav-pulse': String(activeTarget.pulse),
            'data-nav-target': 'true',
            style: {
              ...(props.style ?? {}),
              '--plate-nav-feedback-duration': `${activeTarget.duration}ms`,
            },
          };
        },
      },
    },
    options: {
      activeTarget: null,
      duration: 1600,
    },
  })
    .extendEditorApi<NavigationFeedbackConfig['api']>(({ editor }) => {
      const refreshDecorations = () => {
        editor.api.react.refreshDecorations();
      };
      const getActiveTarget = () => {
        const storedTarget = editor.getOption(
          NavigationFeedbackPluginKey,
          'activeTarget'
        );
        const activeTarget = resolveNavigationFeedbackTarget(storedTarget);

        if (!activeTarget && storedTarget) {
          clearNavigationFeedbackTarget(editor, refreshDecorations);

          return null;
        }

        return activeTarget;
      };

      return {
        navigation: {
          activeTarget: getActiveTarget,
          clear: () =>
            clearNavigationFeedbackTarget(editor, refreshDecorations),
          isTarget: (path) => {
            const activeTarget = getActiveTarget();

            return !!activeTarget && PathApi.equals(activeTarget.path, path);
          },
        },
      };
    })
    .extendTxGroup('navigation', ({ editor }) => (tx) => {
      const refreshDecorations = () => {
        editor.api.react.refreshDecorations();
      };

      return {
        clear: () => clearNavigationFeedbackTarget(editor, refreshDecorations),
        flashTarget: (options: NavigationFlashTargetOptions) =>
          flashTarget(editor, options, refreshDecorations),
        navigate: (options: NavigationNavigateOptions) =>
          navigate(editor, tx, options, refreshDecorations),
      };
    });
