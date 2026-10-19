import type {
  AuthoredChange,
  AuthoredDecision,
  AuthoredResult,
  AuthoredView,
} from 'plitejs/authored';

type IdDecision = Readonly<{
  action: AuthoredDecision['action'];
  changes: readonly string[];
}>;

type AuthoredTestEditor = {
  api: { authored: { setView: (view: AuthoredView) => void } };
  read: { authored: { change: (id: string) => AuthoredChange | null } };
  update: ((run: (tx: any) => void) => void) & {
    authored: {
      decide: (decisions: readonly AuthoredDecision[]) => AuthoredResult;
    };
  };
};

/**
 * Decide and propose by change id, the way specs name changes. An id the
 * document no longer holds decides as stale.
 */
export const authoredTestApi = (input: object) => {
  const editor = input as unknown as AuthoredTestEditor;
  const changeOf = (id: string): AuthoredChange =>
    editor.read.authored.change(id) ?? {
      authorId: '',
      createdAt: 0,
      id,
      kind: 'insert',
      ranges: [],
      revision: -1,
    };

  return {
    decide: (decisions: IdDecision | readonly IdDecision[]) =>
      editor.update.authored.decide(
        [decisions].flat().map((decision) => ({
          action: decision.action,
          changes: decision.changes.map(changeOf),
        }))
      ),
    /** Record the writes `run` makes under one change, whatever the intent. */
    propose: (changeId: string, run: (tx: any) => void) => {
      editor.update((tx) => {
        tx.authored.propose({ changeId });
        run(tx);
      });
    },
    setIntent: (intent: 'edit' | 'propose') => {
      editor.api.authored.setView({ intent });
    },
  };
};
