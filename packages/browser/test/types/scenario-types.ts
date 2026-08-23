import type {
  EditableCommand,
  EditableCommandDefinition,
  EditableEventFrame,
  EditableKernelTraceEntry,
} from '../../../plite-react/src/editable/editing-kernel';
import type { EditableRepairRequest } from '../../../plite-react/src/editable/mutation-controller';
import type {
  PliteBrowserKernelCommand,
  PliteBrowserKernelCommandDefinition,
  PliteBrowserKernelEventFrame,
  PliteBrowserKernelRepairRequest,
  PliteBrowserKernelTraceExpectation,
  PliteBrowserKernelTraceEntry,
  PliteBrowserScenarioStep,
  PliteBrowserSelectionContractExpectation,
  RenderedDOMShapeExpectation,
} from '../../src/playwright';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <
    Value,
  >() => Value extends Right ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;
type SerializableEditableCommand<TCommand> = TCommand extends {
  kind: 'insert-data';
}
  ? { data?: unknown; kind: 'insert-data' }
  : TCommand;

type KernelCommandParity = Expect<
  Equal<PliteBrowserKernelCommand, SerializableEditableCommand<EditableCommand>>
>;
type KernelCommandDefinitionParity = Expect<
  Equal<PliteBrowserKernelCommandDefinition, EditableCommandDefinition>
>;
type KernelEventFrameParity = Expect<
  Equal<PliteBrowserKernelEventFrame, EditableEventFrame>
>;
type KernelRepairParity = Expect<
  Equal<PliteBrowserKernelRepairRequest, EditableRepairRequest>
>;
type KernelTraceKeysParity = Expect<
  Equal<keyof PliteBrowserKernelTraceEntry, keyof EditableKernelTraceEntry>
>;
type KernelTraceFieldsParity = Expect<
  Equal<
    Omit<
      PliteBrowserKernelTraceEntry,
      | 'command'
      | 'commandDefinition'
      | 'frame'
      | 'repair'
      | 'selectionAfter'
      | 'selectionBefore'
    >,
    Omit<
      EditableKernelTraceEntry,
      | 'command'
      | 'commandDefinition'
      | 'frame'
      | 'repair'
      | 'selectionAfter'
      | 'selectionBefore'
    >
  >
>;

void (null as unknown as KernelCommandParity);
void (null as unknown as KernelCommandDefinitionParity);
void (null as unknown as KernelEventFrameParity);
void (null as unknown as KernelRepairParity);
void (null as unknown as KernelTraceKeysParity);
void (null as unknown as KernelTraceFieldsParity);

// @ts-expect-error count assertions need count, min, or max
const emptyCount: PliteBrowserScenarioStep = {
  kind: 'assertLocatorCount',
  selector: '[data-editor]',
};

const contradictoryCount: PliteBrowserScenarioStep = {
  count: 1,
  kind: 'assertLocatorCount',
  // @ts-expect-error exact count cannot be combined with a range
  min: 100,
  selector: '[data-editor]',
};

// @ts-expect-error false does not assert that a selection is non-empty
const emptyWindowSelection: PliteBrowserScenarioStep = {
  kind: 'assertWindowSelectionText',
  notEmpty: false,
};

const emptyRenderBudget: PliteBrowserScenarioStep = {
  // @ts-expect-error render budgets need total or at least one render kind
  budget: {},
  kind: 'assertRenderBudget',
};

const contradictoryRenderBudget: PliteBrowserScenarioStep = {
  budget: {
    // @ts-expect-error exact render counts cannot be combined with a range
    total: { exact: 1, min: 0 },
  },
  kind: 'assertRenderBudget',
};

const emptyRenderCountRange: PliteBrowserScenarioStep = {
  budget: {
    // @ts-expect-error a render-count range needs min or max
    total: {},
  },
  kind: 'assertRenderBudget',
};

const validRenderBudgets = [
  { budget: { total: 0 }, kind: 'assertRenderBudget' },
  { budget: { total: { exact: 0 } }, kind: 'assertRenderBudget' },
  { budget: { total: { min: 0 } }, kind: 'assertRenderBudget' },
  { budget: { total: { max: 2 } }, kind: 'assertRenderBudget' },
  {
    budget: { total: { max: 2, min: 0 } },
    kind: 'assertRenderBudget',
  },
] satisfies PliteBrowserScenarioStep[];

// @ts-expect-error selection contracts need at least one expectation
const emptySelectionContract: PliteBrowserSelectionContractExpectation = {};

// @ts-expect-error rendered DOM assertions need at least one expectation
const emptyDOMShape: RenderedDOMShapeExpectation = {};

// @ts-expect-error blockIndex selects a block but does not assert its shape
const blockIndexOnlyDOMShape: RenderedDOMShapeExpectation = { blockIndex: 1 };

// @ts-expect-error kernel trace assertions need at least one expectation
const emptyKernelTrace: PliteBrowserKernelTraceExpectation = {};

const emptyIncludedTags: PliteBrowserScenarioStep = {
  kind: 'assertLastCommitIncludesTags',
  // @ts-expect-error inclusion assertions need at least one tag
  tags: [],
};

void [
  emptyCount,
  contradictoryCount,
  blockIndexOnlyDOMShape,
  emptyDOMShape,
  emptyIncludedTags,
  emptyKernelTrace,
  emptyRenderBudget,
  emptyRenderCountRange,
  contradictoryRenderBudget,
  emptySelectionContract,
  emptyWindowSelection,
  validRenderBudgets,
];
