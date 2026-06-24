import {
  type Location,
  type NodeEntry,
  type Range,
  RangeApi,
  type Element as PliteElement,
  type TextInsertTextOptions,
  type Value,
} from '@platejs/plite';

import { mergePlugins } from '../../internal/utils/mergePlugins';
import type { ResolvedInputRule } from '../../lib/plugins/input-rules/types';
import type {
  PlateRuntimeEditor,
  PlateRuntimePlugin,
  PlateRuntimeTransforms,
} from './createPlateRuntimeEditor';

type RuntimeInputRulesDependencies = {
  getBlockPath: <V extends Value, const TExtensions extends readonly unknown[]>(
    editor: PlateRuntimeEditor<V, TExtensions>,
    at?: Location
  ) => number[] | null | undefined;
  getDescendant: <
    V extends Value,
    const TExtensions extends readonly unknown[],
  >(
    editor: PlateRuntimeEditor<V, TExtensions>,
    path: number[]
  ) => unknown;
  isElementNode: (node: unknown) => node is PliteElement;
  readRuntimeTransforms: <
    V extends Value,
    const TExtensions extends readonly unknown[],
  >(
    editor: PlateRuntimeEditor<V, TExtensions>
  ) => PlateRuntimeTransforms<V, TExtensions>;
};

const createRuntimeCachedGetter = <TValue>(compute: () => TValue) => {
  let hasValue = false;
  let value: TValue;

  return () => {
    if (!hasValue) {
      value = compute();
      hasValue = true;
    }

    return value;
  };
};

type RuntimeInputRuleSelectionContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = {
  editor: PlateRuntimeEditor<V, TExtensions>;
  getBlockEntry: () => NodeEntry<PliteElement> | undefined;
  getBlockStartRange: () => Range | undefined;
  getBlockStartText: () => string | undefined;
  getBlockTextBeforeSelection: () => string;
  getCharAfter: () => string | undefined;
  getCharBefore: () => string | undefined;
  isCollapsed: boolean;
  pluginKey: string;
};

type RuntimeInsertBreakInputRuleContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = RuntimeInputRuleSelectionContext<V, TExtensions> & {
  cause: 'insertBreak';
  insertBreak: () => void;
};

type RuntimeInsertDataInputRuleContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = RuntimeInputRuleSelectionContext<V, TExtensions> & {
  cause: 'insertData';
  data: DataTransfer;
  insertData: (data: DataTransfer) => void;
  text: string | null;
};

type RuntimeInsertTextInputRuleContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = RuntimeInputRuleSelectionContext<V, TExtensions> & {
  cause: 'insertText';
  insertText: (
    text: string,
    options?: TextInsertTextOptions & { marks?: boolean }
  ) => void;
  options?: TextInsertTextOptions & { marks?: boolean };
  text: string;
};

type RuntimeInputRule<TContext> = {
  apply: (context: TContext, match: unknown) => boolean | void;
  enabled?: (context: TContext) => boolean;
  resolve?: (context: TContext) => unknown;
};

const createRuntimeInputRuleSelectionContext = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  pluginKey: string,
  { getBlockPath, getDescendant, isElementNode }: RuntimeInputRulesDependencies
): RuntimeInputRuleSelectionContext<V, TExtensions> => {
  const selection = editor.read((state) => state.selection.get());
  const isCollapsed = !!selection && RangeApi.isCollapsed(selection);
  const readBlockPath = createRuntimeCachedGetter(() =>
    selection ? getBlockPath(editor, selection) : undefined
  );
  const getBlockEntry = createRuntimeCachedGetter(() => {
    const path = readBlockPath();

    if (!path) return;

    const node = getDescendant(editor, path);

    return isElementNode(node)
      ? ([node as PliteElement, path] as NodeEntry<PliteElement>)
      : undefined;
  });
  const getBlockStartRange = createRuntimeCachedGetter(() => {
    const path = readBlockPath();

    if (!selection || !path) return;

    const focus = RangeApi.start(selection);
    const anchor = editor.read((state) => state.points.start(path));

    return { anchor, focus };
  });
  const getBlockStartText = createRuntimeCachedGetter(() => {
    const range = getBlockStartRange();

    return range ? editor.read((state) => state.text.string(range)) : undefined;
  });

  return {
    editor,
    getBlockEntry,
    getBlockStartRange,
    getBlockStartText,
    getBlockTextBeforeSelection: createRuntimeCachedGetter(
      () => getBlockStartText() ?? ''
    ),
    getCharAfter: createRuntimeCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const afterPoint = editor.read((state) =>
        state.points.after(selection, { distance: 1, unit: 'character' })
      );

      if (!afterPoint) return;

      return (
        editor.read((state) =>
          state.text.string({ anchor: selection.anchor, focus: afterPoint })
        ) || undefined
      );
    }),
    getCharBefore: createRuntimeCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const beforePoint = editor.read((state) =>
        state.points.before(selection, { distance: 1, unit: 'character' })
      );

      if (!beforePoint) return;

      return (
        editor.read((state) =>
          state.text.string({ anchor: beforePoint, focus: selection.anchor })
        ) || undefined
      );
    }),
    isCollapsed,
    pluginKey,
  };
};

const isRuntimeInputRuleTriggerMatch = (
  trigger: readonly string[] | string,
  text: string
) => (Array.isArray(trigger) ? trigger.includes(text) : trigger === text);

const asRuntimeInputRule = <TContext>(
  rule: ResolvedInputRule
): RuntimeInputRule<TContext> => rule as unknown as RuntimeInputRule<TContext>;

const runRuntimeInputRule = <TContext>(
  rule: ResolvedInputRule,
  context: TContext
) => {
  const runtimeRule = asRuntimeInputRule<TContext>(rule);

  if (runtimeRule.enabled?.(context) === false) return false;

  const match = runtimeRule.resolve ? runtimeRule.resolve(context) : true;

  if (match === undefined) return false;

  return runtimeRule.apply(context, match) !== false;
};

const executeRuntimeInputRulesInsertBreak = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  insertBreak: () => boolean | void,
  dependencies: RuntimeInputRulesDependencies
) => {
  for (const rule of editor.meta.inputRules.insertBreak) {
    const context: RuntimeInsertBreakInputRuleContext<V, TExtensions> = {
      cause: 'insertBreak',
      insertBreak: () => {
        insertBreak();
      },
      ...createRuntimeInputRuleSelectionContext(
        editor,
        rule.pluginKey,
        dependencies
      ),
    };

    if (runRuntimeInputRule(rule, context)) return true;
  }

  return false;
};

const executeRuntimeInputRulesInsertData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  data: DataTransfer,
  insertData: (data: DataTransfer) => boolean | void,
  dependencies: RuntimeInputRulesDependencies
) => {
  const text = data.getData('text/plain') || null;

  for (const rule of editor.meta.inputRules.insertData) {
    const context: RuntimeInsertDataInputRuleContext<V, TExtensions> = {
      cause: 'insertData',
      data,
      insertData: (nextData) => {
        insertData(nextData);
      },
      text,
      ...createRuntimeInputRuleSelectionContext(
        editor,
        rule.pluginKey,
        dependencies
      ),
    };

    if (
      rule.mimeTypes &&
      rule.mimeTypes.length > 0 &&
      !rule.mimeTypes.some((type) => !!context.data.getData(type))
    ) {
      continue;
    }

    if (runRuntimeInputRule(rule, context)) return true;
  }

  return false;
};

const executeRuntimeInputRulesInsertText = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  text: string,
  options: (TextInsertTextOptions & { marks?: boolean }) | undefined,
  insertText: (
    text: string,
    options?: TextInsertTextOptions & { marks?: boolean }
  ) => boolean | void,
  dependencies: RuntimeInputRulesDependencies
) => {
  const rules = editor.meta.inputRules.insertText.byTrigger[text] ?? [];

  for (const rule of rules) {
    if (!isRuntimeInputRuleTriggerMatch(rule.trigger, text)) continue;

    const context: RuntimeInsertTextInputRuleContext<V, TExtensions> = {
      cause: 'insertText',
      insertText: (nextText, nextOptions) => {
        insertText(nextText, nextOptions);
      },
      options,
      text,
      ...createRuntimeInputRuleSelectionContext(
        editor,
        rule.pluginKey,
        dependencies
      ),
    };

    if (runRuntimeInputRule(rule, context)) return true;
  }

  return false;
};

export const installRuntimeInputRules = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  dependencies: RuntimeInputRulesDependencies
) => {
  if (!plugin.runtimeInputRules) return;

  const previousInsertBreak =
    dependencies.readRuntimeTransforms(editor).insertBreak;
  const previousInsertData =
    dependencies.readRuntimeTransforms(editor).insertData;
  const previousInsertText =
    dependencies.readRuntimeTransforms(editor).insertText;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertBreak: () => {
      if (
        executeRuntimeInputRulesInsertBreak(
          editor,
          previousInsertBreak,
          dependencies
        )
      ) {
        return true;
      }

      return previousInsertBreak();
    },
    insertData: (data: DataTransfer) => {
      if (
        executeRuntimeInputRulesInsertData(
          editor,
          data,
          previousInsertData,
          dependencies
        )
      ) {
        return true;
      }

      return previousInsertData(data);
    },
    insertText: (
      text: string,
      options?: TextInsertTextOptions & { marks?: boolean }
    ) => {
      if (
        executeRuntimeInputRulesInsertText(
          editor,
          text,
          options,
          previousInsertText,
          dependencies
        )
      ) {
        return true;
      }

      return previousInsertText(text, options);
    },
  }) as PlateRuntimeTransforms;
};
