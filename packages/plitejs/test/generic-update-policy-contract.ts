import {
  createEditor,
  defineExtension,
  type EditorUpdatePolicyFor,
  txOnly,
} from 'plitejs';

const history = defineExtension('history', {
  update: ({ tx }) => ({
    direct() {
      tx.text.insert('direct');
    },
    scoped: txOnly(() => {
      tx.text.insert('scoped');
    }),
  }),
});

const initialValue = [{ type: 'paragraph', children: [{ text: '' }] }];
const rawEditor = createEditor({ initialValue });
const editor = createEditor({
  extensions: [history] as const,
  initialValue,
});
const policy = {
  history: 'new-batch',
  tags: ['paste'],
} satisfies EditorUpdatePolicyFor<typeof editor>;

const assertGenericUpdatePolicyTypes = () => {
  rawEditor.update({ tags: 'paste' }).text.insert('tagged');

  // @ts-expect-error history policy requires an installed history tx group
  rawEditor.update({ history: 'skip' }).text.insert('skipped');

  editor.update(policy, (tx) => {
    tx.history.scoped();
    tx.text.insert('atomic');
  });

  // @ts-expect-error update policy is the first argument
  editor.update((tx) => tx.text.insert('legacy'), policy);
  editor.update(policy).history.direct();
  editor.update.history.direct();

  // @ts-expect-error transaction-only methods require an explicit transaction
  editor.update.history.scoped();
};

void policy;
void assertGenericUpdatePolicyTypes;
