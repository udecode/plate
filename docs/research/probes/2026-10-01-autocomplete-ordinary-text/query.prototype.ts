// PROTOTYPE, throwaway. Question: can an autocomplete query live as ordinary
// editor text, matched from the caret per view, instead of a native input
// inside a void node? See NOTES.md for the answer.
import type { Anchor, Editor, Point, PluginTransaction } from 'plitejs';

export type QueryOptions = {
  triggers: readonly string[];
  /** The character before a trigger: start of block or whitespace. */
  previousChar: RegExp;
  /** A character that may appear in a query; anything else ends it. */
  queryChar: RegExp;
};

export type Match = {
  end: Point;
  query: string;
  start: Point;
  trigger: string;
};

/** View-local state: only the trigger the user dismissed with Escape. */
export type Session = { dismissed: Anchor | null };

export const findMatch = (textBefore: string, options: QueryOptions) => {
  for (let index = textBefore.length - 1; index >= 0; index -= 1) {
    const char = textBefore[index]!;

    if (options.triggers.includes(char)) {
      const previous = index === 0 ? '' : textBefore[index - 1]!;

      return options.previousChar.test(previous)
        ? { offset: index, query: textBefore.slice(index + 1), trigger: char }
        : null;
    }
    if (!options.queryChar.test(char)) return null;
  }

  return null;
};

type View = Pick<Editor, 'anchor' | 'read' | 'update'>;

export const readMatch = (view: View, options: QueryOptions): Match | null => {
  const selection = view.read.selection();

  if (!selection || !('anchor' in selection)) return null;

  const { anchor, focus } = selection as { anchor: Point; focus: Point };

  if (
    anchor.offset !== focus.offset ||
    anchor.path.join() !== focus.path.join()
  ) {
    return null;
  }

  const leaf = view.read.nodes.get(focus.path)?.[0] as
    | { text?: string }
    | undefined;

  if (typeof leaf?.text !== 'string') return null;

  const found = findMatch(leaf.text.slice(0, focus.offset), options);

  return found
    ? {
        end: focus,
        query: found.query,
        start: { path: focus.path, offset: found.offset },
        trigger: found.trigger,
      }
    : null;
};

/** The popup is open when a match exists and its trigger was not dismissed. */
export const readSuggestion = (
  view: View,
  session: Session,
  options: QueryOptions
) => {
  const match = readMatch(view, options);
  const dismissed = session.dismissed?.resolve() as Point | null | undefined;

  if (
    session.dismissed &&
    (!match ||
      !dismissed ||
      dismissed.path.join() !== match.start.path.join() ||
      dismissed.offset !== match.start.offset)
  ) {
    session.dismissed.release();
    session.dismissed = null;
  }

  return { match, open: !!match && !session.dismissed };
};

export const dismiss = (view: View, session: Session, match: Match) => {
  session.dismissed?.release();
  session.dismissed = view.anchor(match.start, {
    association: 'forward',
    deletion: 'drop',
  }) as Anchor;
};

/** Replaces trigger and query with the completion in one history entry. */
export const complete = (
  view: View,
  match: Match,
  insert: (tx: PluginTransaction) => void
) =>
  view.update({ history: 'new-batch' }, (tx) => {
    tx.text.delete({ at: { anchor: match.start, focus: match.end } });
    tx.selection.set(match.start);
    insert(tx as unknown as PluginTransaction);
  });
