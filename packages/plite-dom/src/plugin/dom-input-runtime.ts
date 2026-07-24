import type { Range, RootKey } from '@platejs/plite';

type DOMInputEventFamily =
  | 'beforeinput'
  | 'blur'
  | 'click'
  | 'compositionend'
  | 'compositionstart'
  | 'compositionupdate'
  | 'copy'
  | 'cut'
  | 'dragend'
  | 'dragover'
  | 'dragstart'
  | 'drop'
  | 'focus'
  | 'input'
  | 'keydown'
  | 'mousedown'
  | 'paste'
  | 'repair'
  | 'selectionchange';

type DOMInputOwnership =
  | 'app-owned'
  | 'deferred'
  | 'model-owned'
  | 'native-allowed'
  | 'native-denied'
  | 'no-op';

type DOMInputTargetOwner =
  | 'app-owned'
  | 'editor'
  | 'internal-control'
  | 'outside-editor'
  | 'partial-dom'
  | 'unknown';

type DOMInputSelectionSource =
  | 'app-owned'
  | 'composition-owned'
  | 'dom-current'
  | 'internal-control'
  | 'model-owned'
  | 'partial-dom-backed'
  | 'unknown';

type DOMInputSelectionChangeOrigin =
  | 'browser-handle'
  | 'native-user'
  | 'programmatic-export'
  | 'repair-induced'
  | 'unknown';

type DOMInputSelectionPolicy = Readonly<{
  kind:
    | 'clear'
    | 'export-model'
    | 'import-dom'
    | 'none'
    | 'partial-dom'
    | 'preserve-model';
  reason:
    | 'internal-control'
    | 'model-owned'
    | 'native-selection'
    | 'not-requested'
    | 'partial-dom-backed'
    | 'selection-clear'
    | 'unknown-selection';
}>;

type DOMInputRepairPolicy = Readonly<{
  kind:
    | 'force-render'
    | 'none'
    | 'repair-caret'
    | 'repair-text'
    | 'sync-selection';
  reason:
    | 'force-render'
    | 'not-requested'
    | 'repair-caret'
    | 'repair-caret-after-text-insert'
    | 'repair-text'
    | 'sync-selection';
}>;

type DOMInputKernelState =
  | 'app-owned'
  | 'clipboard'
  | 'composition'
  | 'dom-selection'
  | 'dragging'
  | 'idle'
  | 'internal-control'
  | 'model-owned'
  | 'partial-dom-backed'
  | 'repairing';

type DOMInputSelectionSourceTransition = Readonly<{
  preferModelSelection: boolean;
  reason:
    | 'internal-control'
    | 'model-command'
    | 'native-selection-move'
    | 'projection-refresh'
    | 'repair-induced'
    | 'unknown-selection';
  selectionSource: DOMInputSelectionSource;
}>;

type DOMInputTransition = Readonly<{
  allowed: boolean;
  reason: string | null;
}>;

type DOMInputKeyDownDecisionInput<
  TCommand,
  TIntent extends string,
  TSelection,
> = {
  authoritativeModelSelection: boolean;
  command: TCommand | null;
  hasModelOnlySelection: boolean;
  hasProjectedViewSelection: boolean;
  intent: TIntent | null;
  internalTarget: boolean;
  selectionBefore: TSelection;
  selectionSource: DOMInputSelectionSource;
  targetOwner: DOMInputTargetOwner;
};

type DOMInputBeforeInputDecisionInput<
  TCommand,
  TIntent extends string,
  TSelection,
> = {
  authoritativeModelSelection: boolean;
  command: TCommand | null;
  formatInput: boolean;
  hasProjectedViewSelection: boolean;
  intent: TIntent | null;
  internalTarget: boolean;
  selectionBefore: TSelection;
  selectionSource: DOMInputSelectionSource;
  targetOwner: DOMInputTargetOwner;
};

type DOMInputSimpleDecisionInput<TIntent extends string, TSelection> = {
  intent: TIntent;
  internalTarget: boolean;
  selectionBefore: TSelection;
  selectionSource: DOMInputSelectionSource;
  targetOwner: DOMInputTargetOwner;
};

type DOMInputFocusMouseDecisionInput<TSelection> = {
  internalTarget: boolean;
  selectionBefore: TSelection;
  selectionSource: DOMInputSelectionSource;
  targetOwner: DOMInputTargetOwner;
};

type DOMInputNativeInputDecisionInput<TIntent extends string, TSelection> = {
  intent: TIntent | null;
  internalTarget: boolean;
  selectionBefore: TSelection;
  selectionSource: DOMInputSelectionSource;
  targetOwner: DOMInputTargetOwner;
};

type DOMInputTransitionInput = {
  commandKind: string | null;
  commandPresent: boolean;
  eventFamily: DOMInputEventFamily;
  frameLifecyclePhase: 'commit' | 'event' | 'external' | 'layout-effect' | null;
  nativeAllowed: boolean;
  ownership: DOMInputOwnership;
  repairPolicy: DOMInputRepairPolicy;
  selectionChangeOrigin?: DOMInputSelectionChangeOrigin;
  selectionPolicy?: DOMInputSelectionPolicy;
  stateAfter: DOMInputKernelState;
  targetOwner: DOMInputTargetOwner;
};

type DOMInputEventFrame<
  TIntent = unknown,
  TSelection = Range | null,
> = Readonly<{
  active: boolean;
  commitEpoch: number | null;
  eventFamily: DOMInputEventFamily;
  focusOwner: DOMInputTargetOwner;
  generation: number;
  id: number;
  inputIntent: TIntent | null;
  lifecyclePhase: 'commit' | 'event' | 'external' | 'layout-effect';
  modelSelectionBefore: TSelection;
  root: RootKey;
  selectionSource: DOMInputSelectionSource;
  startedAt: number;
  targetOwner: DOMInputTargetOwner;
  viewEpoch: number | null;
}>;

type DOMInputEventFrameInput<TIntent = unknown, TSelection = Range | null> = {
  commitEpoch?: number | null;
  eventFamily: DOMInputEventFamily;
  focusOwner?: DOMInputTargetOwner;
  inputIntent?: TIntent | null;
  lifecyclePhase?: 'commit' | 'event' | 'external' | 'layout-effect';
  modelSelectionBefore: TSelection;
  root?: RootKey;
  selectionSource?: DOMInputSelectionSource;
  startedAt?: number;
  targetOwner?: DOMInputTargetOwner;
  viewEpoch?: number | null;
};

type DOMInputEditingEpoch<
  TCommand = unknown,
  TIntent = unknown,
  TSelection = unknown,
> = Readonly<{
  active: boolean;
  command: TCommand | null;
  commandKey: string;
  generation: number;
  handledCommand: TCommand | null;
  handledCommandKey: string | null;
  id: number;
  kind: 'destructive' | 'model-command';
  modelSelectionBefore: TSelection;
  ownership: DOMInputOwnership;
  root: RootKey;
  rootEventFamily: DOMInputEventFamily;
  rootIntent: TIntent | null;
  selectionSource: DOMInputSelectionSource;
  startedAt: number;
  targetOwner: DOMInputTargetOwner;
}>;

type DOMInputEditingEpochInput<
  TCommand = unknown,
  TIntent = unknown,
  TSelection = Range | null,
> = {
  command: TCommand;
  commandKey: string;
  kind: 'destructive' | 'model-command';
  modelSelectionBefore: TSelection;
  ownership: DOMInputOwnership;
  rootEventFamily: DOMInputEventFamily;
  rootIntent: TIntent | null;
  selectionSource: DOMInputSelectionSource;
  startedAt?: number;
  targetOwner: DOMInputTargetOwner;
};

type DOMInputEditingEpochTrace = {
  commandKey: string | null;
  eventFamily: DOMInputEventFamily;
  ownership: DOMInputOwnership;
  selectionChangeOrigin?: DOMInputSelectionChangeOrigin;
};

type DOMInputCommandEditingEpochInput<
  TCommand = unknown,
  TIntent = unknown,
  TSelection = Range | null,
> = Omit<
  DOMInputEditingEpochInput<TCommand, TIntent, TSelection>,
  'commandKey' | 'kind'
>;

type DOMInputCommandEditingEpochTrace<TCommand = unknown> = Omit<
  DOMInputEditingEpochTrace,
  'commandKey'
> & {
  command: TCommand | null;
};

type CompositionEpoch = Readonly<{
  anchor: unknown | null;
  generation: number;
  id: number;
  modelCommitted: boolean;
  owner: 'app' | 'model' | 'native';
  phase:
    | 'committing'
    | 'final-input-ready'
    | 'model-composing'
    | 'native-composing'
    | 'repairing';
  root: RootKey;
  settledInputType: 'insertFromComposition' | 'insertText' | null;
  text: string | null;
}>;

type DOMInputRuntimeOptions = {
  getGeneration: () => number;
  getRoot: () => RootKey;
};

type PendingNativeDOMInput = {
  data: string | null;
  handled: boolean;
  inputType: string;
  target: unknown;
};

type RecentTextInputRepairEcho = {
  expiresAt: number;
  pathKey: string;
  selectionOffset: number;
  text: string;
};

const TRACE_LIMIT = 200;

const describeDOMInputEditingCommand = (command: unknown) => {
  if (!command || typeof command !== 'object') return null;

  const value = command as Record<string, unknown>;

  switch (value.kind) {
    case 'delete': {
      if (value.direction !== 'backward' && value.direction !== 'forward') {
        return null;
      }

      return {
        commandKey: `delete:${value.direction}:${typeof value.unit === 'string' ? value.unit : 'character'}`,
        kind: 'destructive' as const,
      };
    }
    case 'delete-both': {
      if (typeof value.unit !== 'string') return null;

      return {
        commandKey: `delete-both:${value.unit}`,
        kind: 'destructive' as const,
      };
    }
    case 'delete-fragment':
      return {
        commandKey: `delete-fragment:${typeof value.direction === 'string' ? value.direction : 'selection'}`,
        kind: 'destructive' as const,
      };
    case 'insert-break': {
      if (typeof value.variant !== 'string') return null;

      return {
        commandKey: `insert-break:${value.variant}`,
        kind: 'model-command' as const,
      };
    }
    default:
      return null;
  }
};

export const isDOMInputDestructiveEditingCommand = (command: unknown) =>
  describeDOMInputEditingCommand(command)?.kind === 'destructive';

export const isDOMInputEditingEpochCommand = (command: unknown) =>
  describeDOMInputEditingCommand(command) !== null;

export const resolveDOMInputKernelState = (
  source: DOMInputSelectionSource
): DOMInputKernelState => {
  switch (source) {
    case 'app-owned':
      return 'app-owned';
    case 'composition-owned':
      return 'composition';
    case 'dom-current':
      return 'dom-selection';
    case 'internal-control':
      return 'internal-control';
    case 'model-owned':
      return 'model-owned';
    case 'partial-dom-backed':
      return 'partial-dom-backed';
    case 'unknown':
      return 'idle';
  }
};

export const resolveDOMInputSelectionChangeOwnership = ({
  selectionChangeOrigin,
  selectionSource,
}: {
  selectionChangeOrigin: DOMInputSelectionChangeOrigin;
  selectionSource: DOMInputSelectionSource;
}): DOMInputOwnership => {
  if (
    selectionChangeOrigin === 'native-user' ||
    selectionChangeOrigin === 'browser-handle'
  ) {
    return 'native-allowed';
  }
  if (
    selectionChangeOrigin === 'programmatic-export' ||
    selectionChangeOrigin === 'repair-induced'
  ) {
    return 'model-owned';
  }

  return selectionSource === 'dom-current' ? 'native-allowed' : 'no-op';
};

export const resolveDOMInputTransition = ({
  commandKind,
  commandPresent,
  eventFamily,
  frameLifecyclePhase,
  nativeAllowed,
  ownership,
  repairPolicy,
  selectionChangeOrigin,
  selectionPolicy,
  stateAfter,
  targetOwner,
}: DOMInputTransitionInput): DOMInputTransition => {
  if (commandPresent && nativeAllowed) {
    return {
      allowed: false,
      reason: 'command cannot be native-owned',
    };
  }
  if (nativeAllowed && ownership !== 'native-allowed') {
    return {
      allowed: false,
      reason: 'nativeAllowed requires native ownership',
    };
  }
  if (nativeAllowed && repairPolicy.kind !== 'none') {
    return {
      allowed: false,
      reason: 'native-owned events cannot schedule model repair',
    };
  }
  if (
    targetOwner === 'internal-control' &&
    ownership === 'model-owned' &&
    commandKind !== 'history'
  ) {
    return {
      allowed: false,
      reason: 'internal controls cannot dispatch model commands',
    };
  }
  if (eventFamily === 'repair' && stateAfter === 'dom-selection') {
    return {
      allowed: false,
      reason: 'repair cannot hand authority back to stale DOM selection',
    };
  }
  if (eventFamily === 'repair' && selectionPolicy?.kind === 'import-dom') {
    return {
      allowed: false,
      reason: 'repair cannot import DOM selection',
    };
  }
  if (
    selectionPolicy?.kind === 'import-dom' &&
    frameLifecyclePhase !== 'event'
  ) {
    return {
      allowed: false,
      reason: 'selection import requires event lifecycle frame',
    };
  }
  if (
    eventFamily === 'selectionchange' &&
    nativeAllowed &&
    (selectionChangeOrigin === 'programmatic-export' ||
      selectionChangeOrigin === 'repair-induced')
  ) {
    return {
      allowed: false,
      reason: 'programmatic selectionchange cannot re-import as native intent',
    };
  }

  return {
    allowed: true,
    reason: null,
  };
};

export const classifyDOMBeforeInputIntent = ({
  inputType,
  internalTarget,
}: {
  inputType: string;
  internalTarget: boolean;
}) => {
  if (inputType === 'historyUndo' || inputType === 'historyRedo') {
    return 'history' as const;
  }
  if (internalTarget) return 'internal-control' as const;
  if (inputType.startsWith('format')) return 'format' as const;
  if (inputType.includes('Composition')) return 'composition' as const;
  if (inputType.includes('Paste') || inputType.includes('Drop')) {
    return 'clipboard' as const;
  }
  if (inputType.startsWith('delete')) return 'delete' as const;
  if (inputType === 'insertLineBreak' || inputType === 'insertParagraph') {
    return 'insert-break' as const;
  }
  if (inputType.startsWith('insert')) return 'text-insert' as const;

  return null;
};

export const resolveDOMInputSelectionPolicy = ({
  eventFamily,
  ownership,
  selectionSource,
  targetOwner,
}: {
  eventFamily: DOMInputEventFamily;
  ownership: DOMInputOwnership;
  selectionSource: DOMInputSelectionSource;
  targetOwner: DOMInputTargetOwner;
}): DOMInputSelectionPolicy => {
  if (targetOwner === 'internal-control') {
    return { kind: 'none', reason: 'internal-control' };
  }
  if (selectionSource === 'partial-dom-backed') {
    return { kind: 'partial-dom', reason: 'partial-dom-backed' };
  }
  if (eventFamily === 'selectionchange' && ownership === 'native-allowed') {
    return { kind: 'import-dom', reason: 'native-selection' };
  }
  if (ownership === 'model-owned') {
    return { kind: 'preserve-model', reason: 'model-owned' };
  }

  return { kind: 'none', reason: 'not-requested' };
};

export const resolveDOMInputRepairPolicy = (
  repairKind:
    | 'force-render'
    | 'none'
    | 'repair-caret'
    | 'repair-caret-after-text-insert'
    | 'repair-text'
    | 'skip-dom-sync'
    | 'sync-selection'
    | null
): DOMInputRepairPolicy => {
  if (!repairKind || repairKind === 'none' || repairKind === 'skip-dom-sync') {
    return { kind: 'none', reason: 'not-requested' };
  }
  if (repairKind === 'force-render') {
    return { kind: 'force-render', reason: 'force-render' };
  }
  if (repairKind === 'sync-selection') {
    return { kind: 'sync-selection', reason: 'sync-selection' };
  }
  if (repairKind === 'repair-text') {
    return { kind: 'repair-text', reason: 'repair-text' };
  }
  if (repairKind === 'repair-caret-after-text-insert') {
    return {
      kind: 'repair-caret',
      reason: 'repair-caret-after-text-insert',
    };
  }

  return { kind: 'repair-caret', reason: 'repair-caret' };
};

/**
 * Renderer-neutral, private input state for one mounted DOM root.
 *
 * React normalizes host events and delegates ownership here. The runtime never
 * publishes event intents or decisions through the package root.
 */
export class DOMInputRuntime {
  readonly nativeInputState: {
    pendingInput: PendingNativeDOMInput | null;
    pendingRepairOffset: number | null;
    pendingRepairPathKey: string | null;
    recentRepairEcho: RecentTextInputRepairEcho | null;
    suppressedDOMSelection: boolean;
  } = {
    pendingInput: null,
    pendingRepairOffset: null,
    pendingRepairPathKey: null,
    recentRepairEcho: null,
    suppressedDOMSelection: false,
  };

  private compositionEpochValue: CompositionEpoch | null = null;

  private currentEditingEpochValue: DOMInputEditingEpoch | null = null;

  private currentFrameValue: DOMInputEventFrame | null = null;

  private nextCompositionEpochId = 1;

  private nextEditingEpochId = 1;

  private nextFrameId = 1;

  private readonly options: DOMInputRuntimeOptions;

  private pendingCompositionEndValue: unknown = null;

  private readonly traces: unknown[] = [];

  constructor(options: DOMInputRuntimeOptions) {
    this.options = options;
  }

  prepareKeyDownDecision<TCommand, TIntent extends string, TSelection>({
    authoritativeModelSelection,
    command,
    hasModelOnlySelection,
    hasProjectedViewSelection,
    intent,
    internalTarget,
    selectionBefore,
    selectionSource,
    targetOwner,
  }: DOMInputKeyDownDecisionInput<TCommand, TIntent, TSelection>) {
    const ownership: DOMInputOwnership =
      intent === 'internal-control'
        ? 'app-owned'
        : intent === 'composition'
          ? 'native-allowed'
          : intent === 'native-selection-move'
            ? hasModelOnlySelection
              ? 'model-owned'
              : 'native-allowed'
            : intent
              ? 'model-owned'
              : 'no-op';
    const shouldForceDOMImport =
      intent === 'delete' ||
      intent === 'insert-break' ||
      intent === 'model-selection-move';
    const shouldPreserveModelSelection =
      hasModelOnlySelection ||
      intent === 'history' ||
      (authoritativeModelSelection &&
        (ownership === 'model-owned' ||
          intent === 'text-insert' ||
          intent === null));
    const shouldApplyForcedDOMImport =
      shouldForceDOMImport && !shouldPreserveModelSelection;
    const preserveProjectedViewSelection =
      hasProjectedViewSelection && !internalTarget && intent !== 'composition';
    const selectionPolicy: DOMInputSelectionPolicy = internalTarget
      ? { kind: 'none', reason: 'internal-control' }
      : intent === 'composition'
        ? { kind: 'none', reason: 'not-requested' }
        : preserveProjectedViewSelection || shouldPreserveModelSelection
          ? { kind: 'preserve-model', reason: 'model-owned' }
          : {
              kind: 'import-dom',
              reason: shouldApplyForcedDOMImport
                ? 'unknown-selection'
                : 'native-selection',
            };
    const selectionSourceTransition: DOMInputSelectionSourceTransition | null =
      intent === 'native-selection-move' &&
      ownership === 'native-allowed' &&
      !preserveProjectedViewSelection
        ? {
            preferModelSelection: false,
            reason: 'native-selection-move',
            selectionSource: 'dom-current',
          }
        : intent === 'history' && shouldPreserveModelSelection
          ? {
              preferModelSelection: true,
              reason: 'model-command',
              selectionSource: 'model-owned',
            }
          : null;

    return {
      command,
      intent,
      internalTarget,
      nativeAllowed: ownership === 'native-allowed',
      ownership,
      selectionBefore,
      selectionPolicy,
      selectionSourceTransition,
      shouldForceDOMImport: shouldApplyForcedDOMImport,
      stateBefore: resolveDOMInputKernelState(selectionSource),
      targetOwner,
    };
  }

  prepareBeforeInputDecision<TCommand, TIntent extends string, TSelection>({
    authoritativeModelSelection,
    command,
    formatInput,
    hasProjectedViewSelection,
    intent,
    internalTarget,
    selectionBefore,
    selectionSource,
    targetOwner,
  }: DOMInputBeforeInputDecisionInput<TCommand, TIntent, TSelection>) {
    const ownership: DOMInputOwnership =
      intent === 'internal-control'
        ? 'app-owned'
        : formatInput
          ? 'app-owned'
          : intent === 'native-selection-move'
            ? 'native-allowed'
            : intent
              ? 'model-owned'
              : 'no-op';
    const shouldPreserveModelSelection =
      ownership === 'model-owned' && authoritativeModelSelection;
    const preserveProjectedViewSelection =
      targetOwner !== 'internal-control' &&
      ownership === 'model-owned' &&
      hasProjectedViewSelection;
    const selectionPolicy: DOMInputSelectionPolicy =
      targetOwner === 'internal-control'
        ? { kind: 'none', reason: 'internal-control' }
        : preserveProjectedViewSelection || shouldPreserveModelSelection
          ? { kind: 'preserve-model', reason: 'model-owned' }
          : ownership === 'model-owned'
            ? { kind: 'import-dom', reason: 'unknown-selection' }
            : { kind: 'none', reason: 'not-requested' };

    return {
      command,
      intent,
      internalTarget,
      nativeAllowed: ownership === 'native-allowed',
      ownership,
      selectionBefore,
      selectionPolicy,
      selectionSourceTransition: null,
      stateBefore: resolveDOMInputKernelState(selectionSource),
      targetOwner,
    };
  }

  prepareClipboardDecision<TIntent extends string, TSelection>({
    intent,
    internalTarget,
    selectionBefore,
    selectionSource,
    targetOwner,
  }: DOMInputSimpleDecisionInput<TIntent, TSelection>) {
    const ownership: DOMInputOwnership =
      intent === 'internal-control' ? 'app-owned' : 'model-owned';

    return {
      intent,
      internalTarget,
      nativeAllowed: false,
      ownership,
      selectionBefore,
      stateBefore: resolveDOMInputKernelState(selectionSource),
      targetOwner,
    };
  }

  prepareCompositionDecision<TIntent extends string, TSelection>({
    intent,
    internalTarget,
    selectionBefore,
    selectionSource,
    targetOwner,
  }: DOMInputSimpleDecisionInput<TIntent, TSelection>) {
    const ownership: DOMInputOwnership =
      intent === 'internal-control' ? 'app-owned' : 'native-allowed';

    return {
      intent,
      internalTarget,
      nativeAllowed: ownership === 'native-allowed',
      ownership,
      repairPolicy: {
        kind: 'none',
        reason: 'not-requested',
      } satisfies DOMInputRepairPolicy,
      selectionBefore,
      selectionPolicy: {
        kind: 'none',
        reason: internalTarget ? 'internal-control' : 'not-requested',
      } satisfies DOMInputSelectionPolicy,
      stateBefore: resolveDOMInputKernelState(selectionSource),
      targetOwner,
    };
  }

  prepareFocusMouseDecision<TSelection>({
    internalTarget,
    selectionBefore,
    selectionSource,
    targetOwner,
  }: DOMInputFocusMouseDecisionInput<TSelection>) {
    const ownership: DOMInputOwnership = internalTarget
      ? 'app-owned'
      : targetOwner === 'editor'
        ? 'native-allowed'
        : 'no-op';

    return {
      intent: null,
      internalTarget,
      nativeAllowed: ownership === 'native-allowed',
      ownership,
      selectionBefore,
      stateBefore: resolveDOMInputKernelState(selectionSource),
      targetOwner,
    };
  }

  prepareInputDecision<TIntent extends string, TSelection>({
    intent,
    internalTarget,
    selectionBefore,
    selectionSource,
    targetOwner,
  }: DOMInputNativeInputDecisionInput<TIntent, TSelection>) {
    const ownership: DOMInputOwnership =
      intent === 'internal-control'
        ? 'app-owned'
        : intent
          ? 'model-owned'
          : 'deferred';

    return {
      intent,
      internalTarget,
      nativeAllowed: false,
      ownership,
      selectionBefore,
      stateBefore: resolveDOMInputKernelState(selectionSource),
      targetOwner,
    };
  }

  beginFrame<TIntent, TSelection>(
    input: DOMInputEventFrameInput<TIntent, TSelection>
  ): DOMInputEventFrame<TIntent, TSelection> {
    const frame = Object.freeze({
      active: true,
      commitEpoch: input.commitEpoch ?? null,
      eventFamily: input.eventFamily,
      focusOwner: input.focusOwner ?? 'unknown',
      generation: this.options.getGeneration(),
      id: this.nextFrameId++,
      inputIntent: input.inputIntent ?? null,
      lifecyclePhase: input.lifecyclePhase ?? 'event',
      modelSelectionBefore: input.modelSelectionBefore,
      root: input.root ?? this.options.getRoot(),
      selectionSource: input.selectionSource ?? 'unknown',
      startedAt: input.startedAt ?? Date.now(),
      targetOwner: input.targetOwner ?? 'unknown',
      viewEpoch: input.viewEpoch ?? null,
    }) satisfies DOMInputEventFrame<TIntent, TSelection>;

    this.currentFrameValue = frame as DOMInputEventFrame;

    return frame;
  }

  currentFrame<TIntent = unknown, TSelection = Range | null>() {
    const frame = this.currentFrameValue;

    if (frame?.generation !== this.options.getGeneration()) return null;

    return frame as DOMInputEventFrame<TIntent, TSelection> | null;
  }

  endFrame<TIntent = unknown, TSelection = Range | null>() {
    const frame = this.currentFrame<TIntent, TSelection>();

    if (!frame) return null;

    const inactiveFrame = Object.freeze({ ...frame, active: false });

    this.currentFrameValue = inactiveFrame as DOMInputEventFrame;

    return inactiveFrame;
  }

  clearTrace() {
    this.traces.length = 0;
  }

  getTrace<T>() {
    return this.traces as readonly T[];
  }

  recordTrace<T>(trace: T) {
    this.traces.push(trace);
    if (this.traces.length > TRACE_LIMIT) {
      this.traces.splice(0, this.traces.length - TRACE_LIMIT);
    }

    return trace;
  }

  private beginEditingEpoch<TCommand, TIntent, TSelection>(
    input: DOMInputEditingEpochInput<TCommand, TIntent, TSelection>
  ) {
    const epoch = Object.freeze({
      active: true,
      command: input.command,
      commandKey: input.commandKey,
      generation: this.options.getGeneration(),
      handledCommand: null,
      handledCommandKey: null,
      id: this.nextEditingEpochId++,
      kind: input.kind,
      modelSelectionBefore: input.modelSelectionBefore,
      ownership: input.ownership,
      root: this.options.getRoot(),
      rootEventFamily: input.rootEventFamily,
      rootIntent: input.rootIntent,
      selectionSource: input.selectionSource,
      startedAt: input.startedAt ?? Date.now(),
      targetOwner: input.targetOwner,
    }) satisfies DOMInputEditingEpoch<TCommand, TIntent, TSelection>;

    this.currentEditingEpochValue = epoch as DOMInputEditingEpoch;

    return epoch;
  }

  beginCommandEditingEpoch<TCommand, TIntent, TSelection>(
    input: DOMInputCommandEditingEpochInput<TCommand, TIntent, TSelection>
  ) {
    const description = describeDOMInputEditingCommand(input.command);

    if (!description) {
      throw new Error('Editing epochs require a destructive or break command.');
    }

    return this.beginEditingEpoch({
      ...input,
      ...description,
    });
  }

  currentEditingEpoch<
    TCommand = unknown,
    TIntent = unknown,
    TSelection = Range | null,
  >() {
    const epoch = this.currentEditingEpochValue;

    if (epoch?.generation !== this.options.getGeneration()) return null;

    return epoch as DOMInputEditingEpoch<TCommand, TIntent, TSelection> | null;
  }

  endEditingEpoch<
    TCommand = unknown,
    TIntent = unknown,
    TSelection = Range | null,
  >() {
    const epoch = this.currentEditingEpoch<TCommand, TIntent, TSelection>();

    if (!epoch) return null;

    const inactiveEpoch = Object.freeze({ ...epoch, active: false });

    this.currentEditingEpochValue = inactiveEpoch as DOMInputEditingEpoch;

    return inactiveEpoch;
  }

  private beginOrJoinEditingEpoch<TCommand, TIntent, TSelection>(
    input: DOMInputEditingEpochInput<TCommand, TIntent, TSelection>
  ) {
    const current = this.currentEditingEpoch<TCommand, TIntent, TSelection>();

    if (
      current &&
      this.canTraceJoinEditingEpoch(current, {
        commandKey: input.commandKey,
        eventFamily: input.rootEventFamily,
        ownership: input.ownership,
      })
    ) {
      return current;
    }

    return this.beginEditingEpoch(input);
  }

  beginOrJoinCommandEditingEpoch<TCommand, TIntent, TSelection>(
    input: DOMInputCommandEditingEpochInput<TCommand, TIntent, TSelection>
  ) {
    const description = describeDOMInputEditingCommand(input.command);

    if (!description) return null;

    return this.beginOrJoinEditingEpoch({
      ...input,
      ...description,
    });
  }

  private editingEpochForTrace<TCommand, TIntent, TSelection>(
    trace: DOMInputEditingEpochTrace
  ) {
    const epoch = this.currentEditingEpoch<TCommand, TIntent, TSelection>();

    return epoch && this.canTraceJoinEditingEpoch(epoch, trace) ? epoch : null;
  }

  editingEpochForCommandTrace<TCommand, TIntent, TSelection>(
    trace: DOMInputCommandEditingEpochTrace<TCommand>
  ) {
    return this.editingEpochForTrace<TCommand, TIntent, TSelection>({
      commandKey:
        describeDOMInputEditingCommand(trace.command)?.commandKey ?? null,
      eventFamily: trace.eventFamily,
      ownership: trace.ownership,
      selectionChangeOrigin: trace.selectionChangeOrigin,
    });
  }

  private markEditingEpochCommandHandled<TCommand>(
    command: TCommand,
    commandKey: string
  ) {
    const epoch = this.currentEditingEpoch<TCommand>();

    if (!epoch?.active || epoch.commandKey !== commandKey) return;

    this.currentEditingEpochValue = Object.freeze({
      ...epoch,
      handledCommand: command,
      handledCommandKey: commandKey,
    }) as DOMInputEditingEpoch;
  }

  markCommandEditingEpochHandled<TCommand>(command: TCommand) {
    const commandKey = describeDOMInputEditingCommand(command)?.commandKey;

    if (commandKey) {
      this.markEditingEpochCommandHandled(command, commandKey);
    }
  }

  private shouldSkipEditingEpochCommand(commandKey: string) {
    const epoch = this.currentEditingEpoch();

    return Boolean(
      epoch?.active && epoch.handledCommandKey !== null
        ? epoch.handledCommandKey === commandKey
        : false
    );
  }

  shouldSkipCommandEditingEpoch(command: unknown) {
    const commandKey = describeDOMInputEditingCommand(command)?.commandKey;

    return commandKey ? this.shouldSkipEditingEpochCommand(commandKey) : false;
  }

  private completeDuplicateEditingEpochCommand(commandKey: string) {
    if (!this.shouldSkipEditingEpochCommand(commandKey)) return false;

    this.endEditingEpoch();

    return true;
  }

  completeDuplicateCommandEditingEpoch(command: unknown) {
    const commandKey = describeDOMInputEditingCommand(command)?.commandKey;

    return commandKey
      ? this.completeDuplicateEditingEpochCommand(commandKey)
      : false;
  }

  private closeEditingEpochAfterTrace(
    trace: DOMInputEditingEpochTrace & { epochId: number | null }
  ) {
    if (
      trace.epochId !== null &&
      trace.eventFamily === 'selectionchange' &&
      (trace.selectionChangeOrigin === 'repair-induced' ||
        trace.selectionChangeOrigin === 'programmatic-export')
    ) {
      this.endEditingEpoch();
    }
  }

  closeCommandEditingEpochAfterTrace<TCommand>(
    trace: DOMInputCommandEditingEpochTrace<TCommand> & {
      epochId: number | null;
    }
  ) {
    this.closeEditingEpochAfterTrace({
      commandKey:
        describeDOMInputEditingCommand(trace.command)?.commandKey ?? null,
      epochId: trace.epochId,
      eventFamily: trace.eventFamily,
      ownership: trace.ownership,
      selectionChangeOrigin: trace.selectionChangeOrigin,
    });
  }

  beginComposition({
    anchor = null,
    owner = 'native',
    phase = 'native-composing',
  }: {
    anchor?: unknown | null;
    owner?: CompositionEpoch['owner'];
    phase?: CompositionEpoch['phase'];
  } = {}) {
    const epoch = Object.freeze({
      anchor,
      generation: this.options.getGeneration(),
      id: this.nextCompositionEpochId++,
      modelCommitted: false,
      owner,
      phase,
      root: this.options.getRoot(),
      settledInputType: null,
      text: null,
    }) satisfies CompositionEpoch;

    this.compositionEpochValue = epoch;

    return epoch;
  }

  get compositionEpoch() {
    return this.compositionEpochValue;
  }

  get compositionSession() {
    const epoch = this.compositionEpoch;

    return epoch
      ? {
          modelCommitted: epoch.modelCommitted,
          text: epoch.text,
        }
      : null;
  }

  setCompositionSession(
    session: { modelCommitted: boolean; text?: string | null } | null
  ) {
    if (!session) {
      this.compositionEpochValue = null;
      return;
    }

    const epoch = this.compositionEpoch ?? this.beginComposition();

    this.compositionEpochValue = Object.freeze({
      ...epoch,
      modelCommitted: session.modelCommitted,
      text: session.text ?? null,
    });
  }

  markCompositionModelCommitted() {
    const epoch = this.compositionEpoch;

    if (epoch) {
      this.compositionEpochValue = Object.freeze({
        ...epoch,
        modelCommitted: true,
        owner: 'model',
        phase:
          epoch.phase === 'native-composing' ? 'model-composing' : epoch.phase,
      });
    }
  }

  recordCompositionText(text: string) {
    const epoch = this.compositionEpoch;

    if (epoch) {
      this.compositionEpochValue = Object.freeze({ ...epoch, text });
    }
  }

  settleComposition(
    inputType: 'insertFromComposition' | 'insertText',
    owner: CompositionEpoch['owner']
  ) {
    const epoch = this.compositionEpoch;

    if (!epoch) return null;

    const settled = Object.freeze({
      ...epoch,
      owner,
      phase: 'final-input-ready' as const,
      settledInputType: inputType,
    });

    this.compositionEpochValue = settled;

    return settled;
  }

  setCompositionPhase(phase: CompositionEpoch['phase']) {
    const epoch = this.compositionEpoch;

    if (epoch) {
      this.compositionEpochValue = Object.freeze({ ...epoch, phase });
    }
  }

  getPendingCompositionEnd<T>() {
    return this.pendingCompositionEndValue as T | null;
  }

  setPendingCompositionEnd<T>(pending: T | null) {
    this.pendingCompositionEndValue = pending;
  }

  reset() {
    this.compositionEpochValue = null;
    this.currentEditingEpochValue = null;
    this.currentFrameValue = null;
    this.pendingCompositionEndValue = null;
    this.nativeInputState.pendingInput = null;
    this.nativeInputState.pendingRepairOffset = null;
    this.nativeInputState.pendingRepairPathKey = null;
    this.nativeInputState.recentRepairEcho = null;
    this.nativeInputState.suppressedDOMSelection = false;
    this.traces.length = 0;
  }

  private canTraceJoinEditingEpoch(
    epoch: DOMInputEditingEpoch,
    trace: DOMInputEditingEpochTrace
  ) {
    if (!epoch.active) return false;
    if (trace.eventFamily === epoch.rootEventFamily) return true;
    if (
      trace.eventFamily === 'beforeinput' &&
      trace.commandKey === epoch.commandKey
    ) {
      return true;
    }
    if (
      (trace.eventFamily === 'input' || trace.eventFamily === 'repair') &&
      trace.ownership === 'model-owned'
    ) {
      return true;
    }

    return (
      trace.eventFamily === 'selectionchange' &&
      (trace.selectionChangeOrigin === 'repair-induced' ||
        trace.selectionChangeOrigin === 'programmatic-export')
    );
  }
}
