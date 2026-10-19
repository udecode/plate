import {
  createEditor,
  definePlugin,
  type EditorUpdatePolicyFor,
  txLocate,
  txOnly,
} from 'plitejs';

const history = definePlugin('history', {
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
  plugins: [history] as const,
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

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;

const portalProbe = definePlugin('portalProbe', {
  update: () => ({
    callable: Object.assign(() => {}, { child: () => {} }),
    control: txOnly(() => {}),
    echo: txLocate(false, <TValue>(value: TValue) => value),
  }),
});
const portalEditor = createEditor({
  plugins: [portalProbe] as const,
  initialValue,
});

const assertDirectUpdateTypes = () => {
  const portal = portalEditor.plugin(portalProbe).update;
  const echoed = portal.echo({ count: 1 });
  const echoIsInferred: Equal<typeof echoed, { count: number }> = true;

  portal.callable.child();
  portal({ tags: 'paste' }).callable.child();

  // @ts-expect-error a portal call opens its own update, so it has no transaction-only methods
  portal.control();
  // @ts-expect-error the policy form opens its own update too
  portal({ tags: 'paste' }).control();

  portalEditor.update((tx) => {
    tx.portalProbe.control();
    tx.plugin(portalProbe).control();
    tx.plugin('portalProbe').control();
  });

  void echoIsInferred;
};

const rootControl = definePlugin('rootControl', {
  update: () => txOnly(Object.assign(() => {}, { child: () => {} })),
});
const rootEditor = createEditor({
  plugins: [rootControl] as const,
  initialValue,
});

const assertTransactionOnlyGroupTypes = () => {
  // @ts-expect-error a plugin portal cannot reach a transaction-only group's members
  rootEditor.plugin(rootControl).update.child();
  // @ts-expect-error nor through the policy form
  rootEditor.plugin(rootControl).update({ tags: 'paste' }).child();
  // @ts-expect-error nor through editor.update.<name>
  rootEditor.update.rootControl.child();

  rootEditor.update((tx) => {
    tx.rootControl.child();
    tx.plugin(rootControl).child();
  });
};

void policy;
void assertGenericUpdatePolicyTypes;
void assertDirectUpdateTypes;
void assertTransactionOnlyGroupTypes;
