import {
  type BlockFenceInputRuleMatch,
  type BlockStartInputRuleMatch,
  defineBasePlugin,
  createRuleFactory,
  type InputRuleEditor,
  type InsertTextInputRule,
  type TextSubstitutionMatch,
} from 'platejs';

const ListInputRulePlugin = defineBasePlugin('listInputRule', {
  update: () => ({
    toggle: (style: 'decimal' | 'disc') => style,
  }),
});

const createListInputRule = createRuleFactory(ListInputRulePlugin);

createRuleFactory({
  type: 'mark',
  mark: ListInputRulePlugin,
  start: '**',
  trigger: '*',
})();

createRuleFactory({
  type: 'blockStart',
  match: '-',
  node: ListInputRulePlugin,
  trigger: ' ',
})();

const listInputRule = createListInputRule({
  type: 'blockStart',
  apply: ({ tx }) => {
    const style: 'decimal' | 'disc' = tx.listInputRule.toggle('disc');

    void style;

    // @ts-expect-error Plugin-bound input rules expose only installed tx groups.
    tx.missingInputRule.toggle();
  },
  match: '-',
  trigger: ' ',
})();

const portableListInputRule: InsertTextInputRule<
  BlockStartInputRuleMatch,
  InputRuleEditor
> = listInputRule;

const blockStartRule = createRuleFactory({
  type: 'blockStart',
  apply: (_context, match) => {
    const range: BlockStartInputRuleMatch['range'] = match.range;
    const depth: number = match.depth;

    void depth;
    void range;
  },
  match: '>',
  resolveMatch: () => ({ depth: 1 }),
  trigger: ' ',
})();
declare const blockStartMatch: Parameters<typeof blockStartRule.apply>[1];
const blockStartDepth: number = blockStartMatch.depth;

const blockFenceRule = createRuleFactory({
  type: 'blockFence',
  apply: (_context, match) => {
    const path: BlockFenceInputRuleMatch['path'] = match.path;

    void path;
  },
  block: ListInputRulePlugin,
  fence: '```',
  on: 'match',
})();
declare const blockFenceMatch: Parameters<typeof blockFenceRule.apply>[1];
const blockFencePath: BlockFenceInputRuleMatch['path'] = blockFenceMatch.path;

const insertTextRule = createRuleFactory({
  type: 'insertText',
  apply: (_context, match) => {
    const token: string = match.token;

    void token;
  },
  resolve: () => ({ token: 'inline' }),
  trigger: '$',
})();
declare const insertTextMatch: Parameters<typeof insertTextRule.apply>[1];
const insertTextToken: string = insertTextMatch.token;

const insertBreakRule = createRuleFactory({
  type: 'insertBreak',
  apply: (_context, match) => {
    const block: string = match.block;

    void block;
  },
  resolve: () => ({ block: 'break' }),
})();
declare const insertBreakMatch: Parameters<typeof insertBreakRule.apply>[1];
const insertBreakBlock: string = insertBreakMatch.block;

const insertDataRule = createRuleFactory({
  type: 'insertData',
  apply: (_context, match) => {
    const format: string = match.format;

    void format;
  },
  resolve: () => ({ format: 'text/plain' }),
})();
declare const insertDataMatch: Parameters<typeof insertDataRule.apply>[1];
const insertDataFormat: string = insertDataMatch.format;

const markRule = createRuleFactory({
  type: 'mark',
  start: '**',
  trigger: '*',
})();
declare const markMatch: Parameters<typeof markRule.apply>[1];
const markStartPoint = markMatch.afterStartMatchPoint;

const substitutionRule = createRuleFactory({
  type: 'textSubstitution',
  patterns: [{ format: '—', match: '--' }],
})();
declare const substitutionMatch: Parameters<typeof substitutionRule.apply>[1];
const exactSubstitutionMatch: TextSubstitutionMatch = substitutionMatch;

type IsAny<T> = 0 extends 1 & T ? true : false;

const inputRuleMatchAnyGuards: readonly [
  IsAny<typeof blockStartMatch>,
  IsAny<typeof blockFenceMatch>,
  IsAny<typeof insertTextMatch>,
  IsAny<typeof insertBreakMatch>,
  IsAny<typeof insertDataMatch>,
  IsAny<typeof markMatch>,
  IsAny<typeof substitutionMatch>,
] = [false, false, false, false, false, false, false];

void exactSubstitutionMatch;
void blockFencePath;
void blockStartDepth;
void insertBreakBlock;
void insertDataFormat;
void insertTextToken;
void inputRuleMatchAnyGuards;
void markStartPoint;
void portableListInputRule;
