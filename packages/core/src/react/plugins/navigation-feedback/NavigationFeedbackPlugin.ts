import { defineEffect, type Path, PathApi } from '@platejs/plite';

import type { BaseEditor } from '../../../lib/editor';
import type { DefinitionOf } from '../../../lib/plugin';
import { definePlatePlugin } from '../../plugin';
import { useEditorPluginStore } from '../../stores';
import type {
  NavigationFlashTargetOptions,
  NavigationNavigateOptions,
  NavigationFeedbackPluginState,
  NavigationFeedbackStoredTarget,
} from './types';
import { NAVIGATION_FEEDBACK_NAME } from './types';

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
const NAVIGATION_FEEDBACK_TARGET = new WeakMap<
  BaseEditor,
  NavigationFeedbackStoredTarget
>();

const initialState: NavigationFeedbackPluginState = {
  duration: 1600,
  target: null,
};

export const NavigationFeedbackPlugin = definePlatePlugin(
  NAVIGATION_FEEDBACK_NAME,
  {
    effectTypes: [navigationFeedbackEffect],
    inject: {
      isElement: true,
      nodeProps: {
        transformProps: ({ editor, element, path, plugin, props, text }) => {
          const activeTarget = useEditorPluginStore(
            editor,
            plugin,
            (state) => state.target
          );
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
              ...props.style,
              '--plate-nav-feedback-duration': `${activeTarget.duration}ms`,
            },
          };
        },
      },
    },
    initialState,
    on: {
      commit({ commit, editor, store }) {
        const refreshDecorations = () => {
          editor.api.react.refreshDecorations();
        };
        const clear = (pulse?: number) => {
          const activeTarget = store.get('target');
          const storedTarget = NAVIGATION_FEEDBACK_TARGET.get(editor);

          if (!activeTarget && !storedTarget) return false;
          if (
            pulse !== undefined &&
            (activeTarget?.pulse ?? storedTarget?.pulse) !== pulse
          ) {
            return false;
          }

          const timeoutId = NAVIGATION_FEEDBACK_TIMEOUT.get(editor);

          if (timeoutId) {
            clearTimeout(timeoutId);
            NAVIGATION_FEEDBACK_TIMEOUT.delete(editor);
          }

          storedTarget?.pathAnchor.release();
          NAVIGATION_FEEDBACK_TARGET.delete(editor);
          store.set({ target: null });
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
          const previousTarget = NAVIGATION_FEEDBACK_TARGET.get(editor);
          const timeoutId = NAVIGATION_FEEDBACK_TIMEOUT.get(editor);

          if (timeoutId) {
            clearTimeout(timeoutId);
            NAVIGATION_FEEDBACK_TIMEOUT.delete(editor);
          }

          previousTarget?.pathAnchor.release();
          NAVIGATION_FEEDBACK_TARGET.set(editor, {
            cycle: pulse % 2 === 0 ? 0 : 1,
            duration: timeoutMs,
            pathAnchor: editor.anchor(target.path, {
              association: 'forward',
              deletion: 'drop',
            }),
            pulse,
            type: target.type,
            variant,
          });
          store.set({
            target: {
              cycle: pulse % 2 === 0 ? 0 : 1,
              duration: timeoutMs,
              path: [...target.path],
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
        const storedTarget = NAVIGATION_FEEDBACK_TARGET.get(editor);

        if (!storedTarget) return;

        const path = storedTarget.pathAnchor.resolve();

        if (!path) {
          clear(storedTarget.pulse);

          return;
        }

        const activeTarget = store.get('target');

        if (activeTarget && !PathApi.equals(activeTarget.path, path)) {
          store.set({
            target: {
              ...activeTarget,
              path,
            },
          });
          refreshDecorations();
        }
      },
    },
    selectors: {
      activeTarget: (state) => state.target,
      isTarget: (state, path: Path) =>
        !!state.target && PathApi.equals(state.target.path, path),
    },
    update: ({ tx }) => ({
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
  }
);

export type NavigationFeedbackDefinition = DefinitionOf<
  typeof NavigationFeedbackPlugin
>;

export type NavigationFeedbackUpdate = NavigationFeedbackDefinition['update'];
