import {
  defineEffect,
  type Editor,
  type EditorEffectHistoryReplayResult,
  type EditorEffectType,
  valueCodecs,
} from 'plitejs';

type Transition = Readonly<{ previous: string; value: string }>;

const sessionEffect = defineEffect<Transition>({
  history: {
    replay: (editor, transition) => {
      const inferredEditor: Editor = editor;
      const inferredTransition: Transition = transition;

      void inferredEditor;

      return {
        status: 'applied',
        value: inferredTransition,
      } satisfies EditorEffectHistoryReplayResult<Transition>;
    },
  },
  invert: ({ previous, value }) => ({ previous: value, value: previous }),
  key: 'contract.session-effect',
});

const inspectEffect = (effect: EditorEffectType<Transition>) => {
  if (typeof effect.history === 'object') {
    const local: 'local' = effect.collab;
    const replayResult = effect.history.replay({} as Editor, {
      previous: '',
      value: 'comment',
    });

    void local;
    void replayResult;
  }
};

inspectEffect(sessionEffect);

defineEffect<string>({
  persist: { ...valueCodecs.string, version: 1 },
  collab: 'shared',
  collabReplay: 'live',
  history: 'push',
  key: 'contract.shared-effect',
});

defineEffect<string>({
  persist: { ...valueCodecs.string, version: 1 },
  collab: 'shared',
  collabReplay: 'live',
  history: {
    // @ts-expect-error shared effects cannot own live-session replay work
    replay: (_editor, value) => ({ status: 'applied', value }),
  },
  key: 'contract.invalid-shared-session',
});
