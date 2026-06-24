import { createEditor, type Operation, type ValueOf } from '@platejs/plite';
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

const operation: Operation<ValueOf<typeof editor>> | undefined = editor.read(
  (state) => state.history.undos()[0]?.operations[0]
);
const historyValue = editor.read((state) => state.history.get());

editor.update((tx) => {
  tx.history.undo();
  tx.history.redo();
});

editor.api.history.withoutSaving(() => {
  editor.update((tx) => {
    tx.text.insert('b');
  });
});
editor.api.history.withoutMerging(() => {
  editor.update((tx) => {
    tx.text.insert('c');
  });
});
editor.getApi(HistoryExtension).withNewBatch(() => {
  editor.update((tx) => {
    tx.text.insert('d');
  });
});

const assertHistoryTypeErrors = () => {
  // @ts-expect-error history stacks are read through state.history
  editor.api.history.undos();

  // @ts-expect-error undo is a replayable tx action, not an ambient api action
  editor.api.history.undo();

  // @ts-expect-error history is extension state, not an editor root field
  editor.history;

  // @ts-expect-error undo is exposed on tx.history, not the editor root
  editor.undo();

  // @ts-expect-error public withHistory wrapper is cut
  PliteHistory.withHistory;
};

void assertHistoryTypeErrors;
void historyValue;
void operation;
