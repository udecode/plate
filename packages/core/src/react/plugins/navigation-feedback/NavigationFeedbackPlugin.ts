import { defineEffect, PathApi } from '@platejs/plite';

import type { BaseEditor } from '../../../lib/editor';
import { createPlatePlugin } from '../../plugin';
import { useEditorPluginStore } from '../../stores';
import type {
  NavigationFeedbackActiveTarget,
  NavigationFeedbackConfig,
  NavigationFlashTargetOptions,
  NavigationNavigateOptions,
  NavigationFeedbackStoredTarget,
} from './types';
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

const NAVIGATION_FEEDBACK_TIMEOUT = new WeakMap<
  BaseEditor,
  ReturnType<typeof setTimeout>
>();
const NAVIGATION_FEEDBACK_PULSE = new WeakMap<BaseEditor, number>();

const resolveNavigationFeedbackTarget = (
  target?: NavigationFeedbackStoredTarget | null
): NavigationFeedbackActiveTarget | null => {
  const path = target?.pathAnchor.resolve();

  if (!target || !path) return null;

  const { pathAnchor: _pathAnchor, ...rest } = target;

  return {
    ...rest,
    path,
  };
};

export const NavigationFeedbackPlugin =
  createPlatePlugin<NavigationFeedbackConfig>({
    initialState: {
      duration: 1600,
      storedTarget: null,
    },
    key: NAVIGATION_FEEDBACK_KEY,
    selectors: {
      activeTarget: (state) =>
        resolveNavigationFeedbackTarget(state.storedTarget),
      isTarget: (state, path) => {
        const activeTarget = resolveNavigationFeedbackTarget(
          state.storedTarget
        );

        return !!activeTarget && PathApi.equals(activeTarget.path, path);
      },
    },
    update: ({ tx }) => ({
      clear: () => {
        tx.effects.emit(navigationFeedbackEffect, { type: 'clear' });
      },
      flashTarget: (options) => {
        if (!tx.nodes.get(options.target.path)) return false;

        tx.effects.emit(navigationFeedbackEffect, {
          options,
          type: 'flash',
        });

        return true;
      },
      navigate: (options) => {
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
    extension: ({ editor, store }) => {
      const refreshDecorations = () => {
        editor.api.react.refreshDecorations();
      };
      const clear = (pulse?: number) => {
        const storedTarget = store.get('storedTarget');

        if (!storedTarget) return false;
        if (pulse !== undefined && storedTarget.pulse !== pulse) return false;

        const timeoutId = NAVIGATION_FEEDBACK_TIMEOUT.get(editor);

        if (timeoutId) {
          clearTimeout(timeoutId);
          NAVIGATION_FEEDBACK_TIMEOUT.delete(editor);
        }

        storedTarget.pathAnchor.release();
        store.set({ storedTarget: null });
        refreshDecorations();

        return true;
      };
      const flash = ({
        duration,
        target,
        variant = 'navigated',
      }: NavigationFlashTargetOptions) => {
        if (!editor.read.nodes.get(target.path)) return false;

        const pulse = (NAVIGATION_FEEDBACK_PULSE.get(editor) ?? 0) + 1;

        NAVIGATION_FEEDBACK_PULSE.set(editor, pulse);

        const timeoutMs = duration ?? store.get('duration') ?? 800;
        const previousTarget = store.get('storedTarget');
        const timeoutId = NAVIGATION_FEEDBACK_TIMEOUT.get(editor);

        if (timeoutId) {
          clearTimeout(timeoutId);
          NAVIGATION_FEEDBACK_TIMEOUT.delete(editor);
        }

        previousTarget?.pathAnchor.release();
        store.set({
          storedTarget: {
            cycle: (pulse % 2) as 0 | 1,
            duration: timeoutMs,
            pathAnchor: editor.anchor(target.path, {
              association: 'forward',
              deletion: 'drop',
            }),
            pulse,
            type: target.type,
            variant,
          },
        });
        refreshDecorations();

        NAVIGATION_FEEDBACK_TIMEOUT.set(
          editor,
          setTimeout(() => {
            clear(pulse);
          }, timeoutMs)
        );

        return true;
      };

      return {
        effects: [navigationFeedbackEffect],
        onCommit({ commit }) {
          commit.effects.forEach((effect) => {
            if (effect.type !== navigationFeedbackEffect) return;

            if (effect.value.type === 'clear') {
              clear();
            } else if (effect.value.type === 'flash') {
              flash(effect.value.options);
            } else {
              const {
                flash: flashOptions,
                focus = true,
                scroll = true,
                scrollTarget,
                select,
                target,
              } = effect.value.options;

              if (!editor.read.nodes.get(target.path)) return;

              if (focus) editor.api.dom.focus();

              if (scroll) {
                const point =
                  scrollTarget ??
                  (select && 'focus' in select && select.focus
                    ? select.focus
                    : select && 'anchor' in select && select.anchor
                      ? select.anchor
                      : select && 'path' in select
                        ? select
                        : editor.read.points.start(target.path));

                if (point) editor.api.dom.scrollIntoView(point);
              }

              if (flashOptions !== false) {
                flash({
                  duration: flashOptions?.duration,
                  target,
                  variant: flashOptions?.variant,
                });
              }
            }
          });
          const storedTarget = store.get('storedTarget');

          if (storedTarget && !storedTarget.pathAnchor.resolve()) {
            clear(storedTarget.pulse);
          }
        },
      };
    },
    inject: {
      isElement: true,
      nodeProps: {
        transformProps: ({ editor, element, path, plugin, props, text }) => {
          const storedTarget = useEditorPluginStore(
            editor,
            plugin,
            'activeTarget'
          );
          const target = element ?? text;

          if (!storedTarget || !target) return props;
          if (!path || !PathApi.equals(storedTarget.path, path)) {
            return props;
          }

          return {
            ...props,
            'data-nav-cycle': String(storedTarget.cycle),
            'data-nav-highlight': storedTarget.variant,
            'data-nav-pulse': String(storedTarget.pulse),
            'data-nav-target': 'true',
            style: {
              ...(props.style ?? {}),
              '--plate-nav-feedback-duration': `${storedTarget.duration}ms`,
            },
          };
        },
      },
    },
  });
