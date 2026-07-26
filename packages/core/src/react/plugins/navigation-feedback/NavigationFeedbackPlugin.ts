import { defineEffect, PathApi } from '@platejs/plite';

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
import { NavigationFeedbackPluginKey } from './internal/navigationFeedbackPluginKey';
import { NAVIGATION_FEEDBACK_KEY } from './types';

type NavigationFeedbackEffect =
  | { type: 'clear' }
  | { options: NavigationFlashTargetOptions; type: 'flash' }
  | { options: NavigationNavigateOptions; type: 'navigate' };

const navigationFeedbackEffect = defineEffect<NavigationFeedbackEffect>({
  collab: 'local',
  history: 'skip',
  key: 'plate.navigation-feedback',
});

export const NavigationFeedbackPlugin =
  createPlatePlugin<NavigationFeedbackConfig>({
    key: NAVIGATION_FEEDBACK_KEY,
    options: {
      activeTarget: null,
      duration: 1600,
    },
    extension: ({ editor }) => {
      const refreshDecorations = () => {
        editor.api.react.refreshDecorations();
      };
      const getActiveTarget = () => {
        const storedTarget = editor
          .plugin(NavigationFeedbackPluginKey)
          .getOption('activeTarget');
        const activeTarget = resolveNavigationFeedbackTarget(storedTarget);

        if (!activeTarget && storedTarget) {
          clearNavigationFeedbackTarget(editor, refreshDecorations);

          return null;
        }

        return activeTarget;
      };

      return {
        api: {
          navigation: {
            activeTarget: getActiveTarget,
            clear: () =>
              clearNavigationFeedbackTarget(editor, refreshDecorations),
            isTarget: (path) => {
              const activeTarget = getActiveTarget();

              return !!activeTarget && PathApi.equals(activeTarget.path, path);
            },
          },
        },
        effects: [navigationFeedbackEffect],
        onCommit({ commit }) {
          commit.effects.forEach((effect) => {
            if (effect.type !== navigationFeedbackEffect) return;

            if (effect.value.type === 'clear') {
              clearNavigationFeedbackTarget(editor, refreshDecorations);
            } else if (effect.value.type === 'flash') {
              flashTarget(editor, effect.value.options, refreshDecorations);
            } else {
              navigate(editor, effect.value.options, refreshDecorations);
            }
          });
        },
        tx: {
          navigation: (tx) => ({
            clear: () => {
              tx.effects.emit(navigationFeedbackEffect, { type: 'clear' });
            },
            flashTarget: (options: NavigationFlashTargetOptions) => {
              if (!tx.nodes.get(options.target.path)) return false;

              tx.effects.emit(navigationFeedbackEffect, {
                options,
                type: 'flash',
              });

              return true;
            },
            navigate: (options: NavigationNavigateOptions) => {
              if (!tx.nodes.get(options.target.path)) return false;

              if (options.select) {
                if ('focus' in options.select) {
                  tx.selection.set(options.select);
                } else {
                  tx.selection.set({
                    anchor: options.select,
                    focus: options.select,
                  });
                }
              }

              tx.effects.emit(navigationFeedbackEffect, {
                options,
                type: 'navigate',
              });

              return true;
            },
          }),
        },
      };
    },
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
          if (!path || !PathApi.equals(activeTarget.path, path)) {
            return props;
          }

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
  });
