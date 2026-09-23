import {
  createBlockFenceInputRule,
  createBlockStartInputRule,
  createMarkInputRule,
  createTextSubstitutionInputRule,
  defineInputRule,
  definePlugin,
  type BlockFenceInputRuleMatch,
  type BlockStartInputRuleMatch,
  type InsertTextInputRule,
  type MarkInputRuleMatch,
  type TextSubstitutionMatch,
} from 'platejs';

const ListInputRulePlugin = definePlugin('listInputRule', {
  initialState: { enabled: true },
  read: () => ({ enabled: () => true }),
  selectors: { isEnabled: (state) => state.enabled },
  update: () => ({
    toggle: (style: 'decimal' | 'disc') => style,
  }),
});

const listInputRule = defineInputRule(ListInputRulePlugin, {
  target: 'insertText',
  trigger: ' ',
  enabled: ({ editor }) => {
    const plugin = editor.plugin(ListInputRulePlugin);
    const optional = editor.plugin('optionalInputRule');
    const enabled: boolean = plugin.read.enabled();
    const optionalInstalled: boolean = optional.installed;
    plugin.selectors.isEnabled satisfies (state: {
      enabled: boolean;
    }) => boolean;
    const selected: boolean = plugin.store.get('isEnabled');
    const stateEnabled: boolean = plugin.store.get('enabled');

    // @ts-expect-error Matching cannot update the editor.
    editor.update;
    // @ts-expect-error Matching cannot call plugin updates.
    plugin.update;
    // @ts-expect-error Matching cannot mutate plugin state.
    plugin.store.set;
    // @ts-expect-error Name-only lookup keeps plugin capabilities erased.
    optional.api.run();

    return enabled && selected && stateEnabled && !optionalInstalled;
  },
  resolve: (context) => {
    // @ts-expect-error Resolution is read-only and has no transaction.
    context.tx;

    return { depth: 1 };
  },
  apply: ({ next, tx }, match) => {
    const depth: number = match.depth;
    const style: 'decimal' | 'disc' = tx.listInputRule.toggle('disc');

    // @ts-expect-error Plugin-bound rules expose only installed tx groups.
    tx.missingInputRule.toggle();

    void depth;
    void style;

    return next();
  },
});

declare const listMatch: Parameters<typeof listInputRule.apply>[1];
const listDepth: number = listMatch.depth;

const blockStartRule = createBlockStartInputRule({
  apply: ({ decline }, match) => {
    const range: BlockStartInputRuleMatch['range'] = match.range;
    const depth: number = match.depth;

    void depth;
    void range;

    return decline();
  },
  match: '>',
  resolveMatch: () => ({ depth: 1 }),
  trigger: ' ',
});
declare const blockStartMatch: Parameters<typeof blockStartRule.apply>[1];
const blockStartDepth: number = blockStartMatch.depth;

const blockFenceRule = createBlockFenceInputRule({
  apply: ({ decline }, match) => {
    const path: BlockFenceInputRuleMatch['path'] = match.path;

    void path;

    return decline();
  },
  block: ListInputRulePlugin,
  fence: '```',
  on: 'match',
});
declare const blockFenceMatch: Parameters<typeof blockFenceRule.apply>[1];
const blockFencePath: BlockFenceInputRuleMatch['path'] = blockFenceMatch.path;

const insertTextRule = defineInputRule({
  target: 'insertText',
  trigger: '$',
  resolve: () => ({ token: 'inline' }),
  apply: ({ next }, match) => {
    const token: string = match.token;

    void token;

    return next('replacement');
  },
});
declare const insertTextMatch: Parameters<typeof insertTextRule.apply>[1];
const insertTextToken: string = insertTextMatch.token;

const insertBreakRule = defineInputRule({
  target: 'insertBreak',
  resolve: () => ({ block: 'break' }),
  apply: ({ decline }, match) => {
    const block: string = match.block;

    void block;

    return decline();
  },
});
declare const insertBreakMatch: Parameters<typeof insertBreakRule.apply>[1];
const insertBreakBlock: string = insertBreakMatch.block;

const insertDataRule = defineInputRule({
  target: 'insertData',
  resolve: () => ({ format: 'text/plain' }),
  apply: ({ decline }, match) => {
    const format: string = match.format;

    void format;

    return decline();
  },
});
declare const insertDataMatch: Parameters<typeof insertDataRule.apply>[1];
const insertDataFormat: string = insertDataMatch.format;

const markRule = createMarkInputRule({ start: '**', trigger: '*' });
declare const markMatch: Parameters<typeof markRule.apply>[1];
const exactMarkMatch: MarkInputRuleMatch = markMatch;

const substitutionRule = createTextSubstitutionInputRule({
  patterns: [{ format: '—', match: '--' }],
});
declare const substitutionMatch: Parameters<typeof substitutionRule.apply>[1];
const exactSubstitutionMatch: TextSubstitutionMatch = substitutionMatch;

const invalidBooleanApply: InsertTextInputRule = {
  target: 'insertText',
  trigger: 'x',
  // @ts-expect-error Apply consumes with undefined or continues with next(...).
  apply: () => true,
};

type IsAny<T> = 0 extends 1 & T ? true : false;

const inputRuleMatchAnyGuards: readonly [
  IsAny<typeof listMatch>,
  IsAny<typeof blockStartMatch>,
  IsAny<typeof blockFenceMatch>,
  IsAny<typeof insertTextMatch>,
  IsAny<typeof insertBreakMatch>,
  IsAny<typeof insertDataMatch>,
  IsAny<typeof markMatch>,
  IsAny<typeof substitutionMatch>,
] = [false, false, false, false, false, false, false, false];

void blockFencePath;
void blockStartDepth;
void exactMarkMatch;
void exactSubstitutionMatch;
void inputRuleMatchAnyGuards;
void insertBreakBlock;
void insertDataFormat;
void insertTextToken;
void invalidBooleanApply;
void listDepth;
