import { createEditor } from 'plitejs';
import * as PliteHistory from 'plitejs/history';
import { history, type HistoryPluginTypeProvider } from 'plitejs/history';

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

const HistoryPlugin = history();
const historyTypeProvider: HistoryPluginTypeProvider = HistoryPlugin;
const editor = createEditor({ plugins: [HistoryPlugin], initialValue });

editor.update((tx) => {
  tx.text.insert('a');
});

const historyValue = editor.read((state) => state.history());
const directUndoCount: number = editor.read.history().undos.length;
const decodedHistory = PliteHistory.History.fromJSON(
  editor,
  PliteHistory.History.toJSON(editor)
);

editor.update((tx) => {
  tx.history.skip();
  tx.history.merge();
  tx.history.newBatch();
});
editor.api.history.undo();
editor.api.history.redo();
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

void directUndoCount;
void historyTypeProvider;
void historyValue;
