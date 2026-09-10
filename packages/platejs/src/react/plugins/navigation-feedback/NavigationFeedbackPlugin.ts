import React from 'react';

import { ElementApi, type NodeKey } from '../../../facade';
import { DOMPlugin } from '../../../lib/plugins/dom/DOMPlugin';
import { useEditorRootElement } from '../../plite-react';
import {
  definePlatePlugin,
  type PlateViewElementAttributes,
} from '../../plugin';
import type {
  NavigationFeedbackPluginState,
  NavigationFlashTargetOptions,
} from './types';

type FeedbackTarget = Readonly<{
  key: NodeKey;
  attributes: PlateViewElementAttributes;
  duration: number;
  pulse: number;
}>;

type MountedFeedback = {
  root: HTMLElement;
  target: FeedbackTarget | null;
  pulse: number;
  timeout: ReturnType<typeof setTimeout> | null;
  listeners: Set<() => void>;
};

const mountedFeedback = new WeakMap<object, MountedFeedback>();
const emptySnapshot = () => null;

const publish = (state: MountedFeedback, target: FeedbackTarget | null) => {
  if (state.target === target) return;
  state.target = target;
  state.listeners.forEach((listener) => listener());
};

const clear = (state: MountedFeedback) => {
  if (state.timeout !== null) {
    clearTimeout(state.timeout);
    state.timeout = null;
  }
  publish(state, null);
};

const initialState: NavigationFeedbackPluginState = { duration: 1600 };

export const NavigationFeedbackPlugin = definePlatePlugin('navigation', {
  dependencies: [DOMPlugin],
  initialState,
  api: ({ editor, store }) => ({
    /** Flash one live element in this mounted view without changing the document or selection. */
    flashTarget: ({
      key,
      attributes = {},
      duration = store.get('duration'),
    }: NavigationFlashTargetOptions) => {
      const state = mountedFeedback.get(editor);
      if (!state || state.root !== editor.api.dom.root()) return false;
      const path = editor.read.nodes.path(key);
      if (!path || !ElementApi.isElement(editor.read.nodes.get(path)?.[0])) {
        return false;
      }
      if (!Number.isFinite(duration) || duration < 0) {
        throw new RangeError(
          'Flash duration must be a finite non-negative number.'
        );
      }
      if (state.timeout !== null) clearTimeout(state.timeout);
      state.pulse += 1;
      const { pulse } = state;
      const copied = Object.freeze({
        ...attributes,
        ...(attributes.style
          ? { style: Object.freeze({ ...attributes.style }) }
          : {}),
      });
      publish(
        state,
        Object.freeze({ key, attributes: copied, duration, pulse })
      );
      state.timeout = setTimeout(() => {
        if (
          mountedFeedback.get(editor) === state &&
          state.target?.pulse === pulse
        ) {
          clear(state);
        }
      }, duration);
      return true;
    },
    /** Clear this mounted view's feedback, returning whether a target was active. */
    clear: () => {
      const state = mountedFeedback.get(editor);
      if (!state || state.root !== editor.api.dom.root()) return false;
      const hadTarget = state.target !== null;
      clear(state);
      return hadTarget;
    },
  }),
  render: {
    useViewElementAttributes({ view }) {
      const root = useEditorRootElement(view);
      const [state, setState] = React.useState<MountedFeedback | null>(null);

      React.useLayoutEffect(() => {
        if (!root) return undefined;
        const next: MountedFeedback = {
          root,
          target: null,
          pulse: 0,
          timeout: null,
          listeners: new Set(),
        };
        mountedFeedback.set(view, next);
        setState(next);
        const unsubscribe = view.subscribeCommit(() => {
          if (next.target && !view.read.nodes.path(next.target.key)) {
            clear(next);
          }
        });
        return () => {
          unsubscribe();
          if (mountedFeedback.get(view) === next) mountedFeedback.delete(view);
          next.listeners.clear();
          clear(next);
        };
      }, [root, view]);

      const subscribe = React.useCallback(
        (listener: () => void) => {
          state?.listeners.add(listener);
          return () => {
            state?.listeners.delete(listener);
          };
        },
        [state]
      );
      const getSnapshot = React.useCallback(
        () => state?.target ?? null,
        [state]
      );
      const target = React.useSyncExternalStore(
        subscribe,
        getSnapshot,
        emptySnapshot
      );

      return React.useMemo(
        () =>
          target
            ? [
                {
                  key: target.key,
                  attributes: {
                    ...target.attributes,
                    'data-nav-target': 'true',
                    'data-nav-pulse': String(target.pulse),
                    'data-nav-cycle': String(target.pulse % 2),
                    style: {
                      ...target.attributes.style,
                      '--plate-nav-feedback-duration': `${target.duration}ms`,
                    },
                  },
                },
              ]
            : [],
        [target]
      );
    },
  },
});
