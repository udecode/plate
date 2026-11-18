import { withAuthoredUpdateView } from '../../core/authored-runtime';
import type { DocumentChange } from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { getEditorRuntime } from '../../core/editor-runtime';
import {
  getActiveEditorUpdateId,
  registerEditorTransactionGuard,
} from '../../core/public-state';
import { withoutUpdateTagContext } from '../../core/update-context';
import type { SpeculativeUpdate } from '../../core/update-policy';
import type { AnyEditor, EditorCommit } from '../../interfaces/editor';
import { sameDocument } from '../protocol';
import type { SavedBatch } from './outbox';
import type { PreparedLand } from './writer';

export type Landing = Readonly<{
  change: DocumentChange;
  draft: JsonEditorValue;
  head: JsonEditorValue;
  kept: SavedBatch;
  seq: number;
}>;

export type LandingVerdict =
  | 'failed'
  | 'prepared'
  | 'rewritten'
  | 'stopped'
  | null;

export type LandingOutcome = Readonly<{
  landedSeq?: number;
  refusal?: unknown;
  thrown: Readonly<{ value: unknown }> | null;
  verdict: LandingVerdict;
}>;

type Open = {
  held: Map<object, PreparedLand>;
  id: object | null;
  landedSeq?: number;
  readonly landing: Landing;
  verdict: LandingVerdict;
};

const REWRITTEN = new Error('The editor rewrote the recovered draft.');

export const openLandingGate = ({
  capture,
  editor,
  install,
  keptAt,
  prepare,
  stop,
}: Readonly<{
  capture: (
    commit: EditorCommit,
    change: DocumentChange
  ) => (() => void) | undefined;
  editor: AnyEditor;
  install: (prepared: PreparedLand) => boolean;
  keptAt: (seq: number) => SavedBatch | undefined;
  prepare: (seq: number, change: DocumentChange) => PreparedLand;
  stop: () => void;
}>) => {
  let open: Open | null = null;

  const release = registerEditorTransactionGuard(
    editor,
    ({ after, before, change, commit }) => {
      if (
        open &&
        open.id !== null &&
        getActiveEditorUpdateId(editor) === open.id
      ) {
        const { landing } = open;

        if (
          !sameDocument(after, landing.draft) ||
          !sameDocument(before, landing.head) ||
          keptAt(landing.seq) !== landing.kept
        ) {
          open.verdict = 'rewritten';
          throw REWRITTEN;
        }
        try {
          open.held.set(open.id, prepare(landing.seq, change));
        } catch (error) {
          open.verdict = 'failed';
          throw error;
        }
        open.verdict = 'prepared';

        return undefined;
      }
      if (commit.tags.includes('collaboration')) return undefined;

      return capture(commit, change);
    }
  );

  const land = (landing: Landing, view: AnyEditor): LandingOutcome => {
    const state: Open = {
      held: new Map(),
      id: null,
      landing,
      verdict: null,
    };
    const trial: SpeculativeUpdate = { committed: false };
    let thrown: LandingOutcome['thrown'] = null;
    const admit = () => {
      const prepared = state.id === null ? undefined : state.held.get(state.id);

      if (!prepared) return;
      try {
        if (install(prepared)) state.landedSeq = prepared.put.seq;
        else state.verdict = 'stopped';
      } catch {
        state.verdict = 'stopped';
        try {
          stop();
        } catch {
          // The commit is already admitted, so a throw here would leave the
          // editor and the outbox apart with no one told.
        }
      }
    };

    open = state;
    try {
      withoutUpdateTagContext(editor, () =>
        withAuthoredUpdateView(editor, view, () =>
          getEditorRuntime(editor).update(
            (tx) => {
              state.id = getActiveEditorUpdateId(editor);
              tx.tags.add('history-skip');
              tx.changes.apply(landing.change);
            },
            { onAdmission: admit, speculative: trial }
          )
        )
      );
    } catch (error) {
      if (error !== REWRITTEN) thrown = { value: error };
    } finally {
      open = null;
    }

    return {
      ...(state.landedSeq === undefined ? {} : { landedSeq: state.landedSeq }),
      ...('refusal' in trial ? { refusal: trial.refusal } : {}),
      thrown,
      verdict: state.verdict,
    };
  };

  return { land, release };
};
