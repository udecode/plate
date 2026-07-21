import { createEditor } from '@platejs/plite';
import * as PliteHistory from '@platejs/plite-history';
import { history } from '@platejs/plite-history';

type CustomText = {
  text: string;
  bold?: true;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomValue = ParagraphElement[];

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: '' }] },
];

const HistoryExtension = history();
const editor = createEditor({ extensions: [HistoryExtension], initialValue });

editor.update((tx) => {
  tx.text.insert('a');
});

const historyValue = editor.read((state) => state.history());
const directUndoCount: number = editor.read.history.undos().length;
const decodedHistory = PliteHistory.History.fromJSON(
  editor,
  PliteHistory.History.toJSON(editor)
);

editor.update((tx) => {
  tx.history.skip();
  tx.history.merge();
  tx.history.newBatch();
});
editor.update.history.undo();
editor.update.history.redo();
editor.update.history.discardRedo();
editor.update.history.restore(decodedHistory);
editor.update({ history: 'skip' }, (tx) => {
  tx.text.insert('b');
});
editor.update({ history: 'merge' }, (tx) => {
  tx.text.insert('c');
});
editor.update({ history: 'new-batch' }, (tx) => {
  tx.text.insert('d');
});

const assertHistoryTypeErrors = () => {
  // @ts-expect-error history controls only exist on an active transaction
  editor.update.history.skip();

  // @ts-expect-error history stacks are read through state.history
  editor.api.history.undos();

  // @ts-expect-error replay actions live on editor.update, not editor.api
  editor.api.history.undo();

  // @ts-expect-error history controls are tx/update methods, not runtime api methods
  void editor.api.history;

  // @ts-expect-error history is extension state, not an editor root field
  void editor.history;

  // @ts-expect-error undo is exposed on editor.update.history, not the editor root
  editor.undo();

  // @ts-expect-error public withHistory wrapper is cut
  void PliteHistory.withHistory;
};

void assertHistoryTypeErrors;
void directUndoCount;
void historyValue;
