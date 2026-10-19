import assert from 'node:assert/strict';
import {
  BaseParagraphPlugin,
  createEditor,
  DocumentChange,
} from '/Users/zbeyens/git/plate-2/packages/platejs/src/core.tsx';
import { BaseSuggestionPlugin } from '/Users/zbeyens/git/plate-2/packages/platejs/src/features/suggestion/lib/BaseSuggestionPlugin.ts';

const editor = createEditor({
  plugins: [
    BaseParagraphPlugin,
    BaseSuggestionPlugin.configure({
      initialState: { currentUserId: 'alice', isSuggesting: true },
    }),
  ],
  initialValue: [{ type: 'paragraph', children: [{ text: 'original' }] }],
});
const before = editor.read.value();
const change = DocumentChange.between(before, {
  ...before,
  children: [{ type: 'paragraph', children: [{ text: 'replacement' }] }],
});
editor.update((tx) => tx.changes.apply(change));
assert.equal(editor.read.text.string([]), 'replacement');
assert.deepEqual(editor.plugin(BaseSuggestionPlugin).read.reviews(), []);
console.log(JSON.stringify({
  case: 'canonical-change-under-suggesting-mode',
  isSuggesting: editor.plugin(BaseSuggestionPlugin).store.get().isSuggesting,
  text: editor.read.text.string([]),
  reviews: editor.plugin(BaseSuggestionPlugin).read.reviews(),
}));

const overlapping = createEditor({
  plugins: [BaseParagraphPlugin, BaseSuggestionPlugin],
  initialValue: [{
    type: 'paragraph',
    children: [{
      text: 'shared proposed text',
      suggestion: true,
      suggestion_alice: { id: 'alice', createdAt: 1, type: 'insert', userId: 'alice' },
      suggestion_bob: { id: 'bob', createdAt: 2, type: 'insert', userId: 'bob' },
    }],
  }],
});
const initialReviews = overlapping.plugin(BaseSuggestionPlugin).read.reviews().map(({ id }) => id);
overlapping.plugin(BaseSuggestionPlugin).update.reject('alice');
assert.equal(overlapping.read.text.string([]), '');
assert.deepEqual(overlapping.plugin(BaseSuggestionPlugin).read.reviews(), []);
console.log(JSON.stringify({
  case: 'reject-one-overlapping-insertion-id',
  initialReviews,
  rejectedId: 'alice',
  text: overlapping.read.text.string([]),
  reviews: overlapping.plugin(BaseSuggestionPlugin).read.reviews(),
}));
