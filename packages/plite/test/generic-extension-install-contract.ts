import {
  createEditor,
  type Descendant,
  defineEditorExtension,
} from '@platejs/plite';

type CustomText = {
  text: string;
  checked?: true;
};

type ChecklistElement = {
  type: 'checklist';
  children: CustomText[];
};

type CustomValue = ChecklistElement[];

const typeOnly = (_callback: () => void) => {};

const initialValue: CustomValue = [
  { type: 'checklist', children: [{ text: 'todo' }] },
];

const ChecklistExtension = defineEditorExtension({
  name: 'checklist',
  state: {
    checklist(state) {
      return {
        isActive: () => state.selection() != null,
        value: () => state.children() as CustomValue,
      };
    },
  },
  tx: {
    checklist(tx) {
      return {
        toggle() {
          tx.nodes.set({ checked: true }, { at: [0, 0] });
        },
        value: () => tx.children() as CustomValue,
      };
    },
  },
});

const RuntimeHostExtension = defineEditorExtension({
  name: 'runtime-host',
  api: {
    runtimeHost: {
      status() {
        return 'ready' as const;
      },
    },
  },
});

const editor = createEditor({
  initialValue,
  extensions: [ChecklistExtension, RuntimeHostExtension] as const,
});

const installedValue: CustomValue = editor.read((state) =>
  state.checklist.value()
);
const installedActive: boolean = editor.read((state) =>
  state.checklist.isActive()
);
const directInstalledValue: CustomValue = editor.read.checklist.value();
const directInstalledActive: boolean = editor.read.checklist.isActive();

editor.update((tx) => {
  const value: CustomValue = tx.checklist.value();
  tx.checklist.toggle();

  void value;
});
editor.update.checklist.toggle();

const hostStatus: 'ready' = editor.api.runtimeHost.status();
const tokenHostStatus: 'ready' = editor.getApi(RuntimeHostExtension).status();

const OtherRuntimeHostExtension = defineEditorExtension({
  name: 'other-runtime-host',
  api: {
    runtimeHost: {
      status() {
        return 'ready' as const;
      },
    },
  },
});

defineEditorExtension({
  name: 'old-capabilities',
  // @ts-expect-error public extension authoring uses api, not capabilities
  capabilities: {
    checklist: {
      toggle() {},
    },
  },
});

const DisabledChecklistExtension = defineEditorExtension({
  enabled: false,
  name: 'checklist',
});

const DisabledRuntimeHostExtension = defineEditorExtension({
  enabled: false,
  name: 'runtime-host',
});

const disabledEditor = createEditor({
  initialValue,
  extensions: [
    ChecklistExtension,
    DisabledChecklistExtension,
    RuntimeHostExtension,
    DisabledRuntimeHostExtension,
  ] as const,
});

typeOnly(() => {
  // @ts-expect-error disabled extensions do not contribute state groups
  disabledEditor.read((state) => state.checklist.isActive());

  // @ts-expect-error disabled extensions do not contribute tx groups
  disabledEditor.update((tx) => tx.checklist.toggle());

  // @ts-expect-error disabled extensions do not contribute runtime API handles
  disabledEditor.api.runtimeHost.status();

  // @ts-expect-error disabled extension tokens cannot access installed API
  disabledEditor.getApi(RuntimeHostExtension);
});

const FirstSameNameExtension = defineEditorExtension({
  name: 'same-name',
  api: {
    sameName: {
      firstOnly() {},
    },
  },
});

const SecondSameNameExtension = defineEditorExtension({
  name: 'same-name',
  api: {
    sameName: {
      secondOnly() {},
    },
  },
});

const latestWinsEditor = createEditor({
  initialValue,
  extensions: [FirstSameNameExtension, SecondSameNameExtension] as const,
});

latestWinsEditor.api.sameName.secondOnly();

typeOnly(() => {
  // @ts-expect-error latest same-name extension replaces earlier type output
  latestWinsEditor.api.sameName.firstOnly();
});

latestWinsEditor.getApi(SecondSameNameExtension).secondOnly();

typeOnly(() => {
  // @ts-expect-error replaced extension tokens cannot access installed API
  latestWinsEditor.getApi(FirstSameNameExtension);
});

const plainEditor = createEditor({ initialValue });

typeOnly(() => {
  // @ts-expect-error extension state groups are only present when installed
  plainEditor.read((state) => state.checklist.isActive());

  // @ts-expect-error extension tx groups are only present when installed
  plainEditor.update((tx) => tx.checklist.toggle());

  // @ts-expect-error extension api handles are only present when installed
  plainEditor.api.runtimeHost.status();

  // @ts-expect-error capability lookup by string is not public API
  editor.getApi('runtime-host');

  // @ts-expect-error uninstalled extension tokens cannot access installed API
  editor.getApi(OtherRuntimeHostExtension);
});

const _keepsValueInference: Descendant = installedValue[0];
const _keepsBooleanInference: boolean = installedActive;
const _keepsDirectValueInference: Descendant = directInstalledValue[0];
const _keepsDirectBooleanInference: boolean = directInstalledActive;
const _keepsHostStatusInference: 'ready' = hostStatus;
const _keepsTokenHostStatusInference: 'ready' = tokenHostStatus;
