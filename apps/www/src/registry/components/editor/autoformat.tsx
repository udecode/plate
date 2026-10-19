'use client';

import { createTextSubstitutionInputRule, definePlugin } from 'platejs';

const arrowsRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '→', match: '->' },
    { format: '←', match: '<-' },
    { format: '⇒', match: '=>' },
    { format: '⇐', match: ['<=', '≤='] },
  ],
});

const comparisonsRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '≯', match: '!>' },
    { format: '≮', match: '!<' },
    { format: '≥', match: '>=' },
    { format: '≤', match: '<=' },
    { format: '≱', match: ['!>=', '≯='] },
    { format: '≰', match: ['!<=', '≮='] },
  ],
});

const equalityRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '≠', match: '!=' },
    { format: '≡', match: '==' },
    { format: '≢', match: ['!==', '≠='] },
    { format: '≈', match: '~=' },
    { format: '≉', match: '!~=' },
  ],
});

const fractionsRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '½', match: '1/2' },
    { format: '⅓', match: '1/3' },
    { format: '¼', match: '1/4' },
    { format: '⅕', match: '1/5' },
    { format: '⅙', match: '1/6' },
    { format: '⅐', match: '1/7' },
    { format: '⅛', match: '1/8' },
    { format: '⅑', match: '1/9' },
    { format: '⅒', match: '1/10' },
    { format: '⅔', match: '2/3' },
    { format: '⅖', match: '2/5' },
    { format: '¾', match: '3/4' },
    { format: '⅗', match: '3/5' },
    { format: '⅜', match: '3/8' },
    { format: '⅘', match: '4/5' },
    { format: '⅚', match: '5/6' },
    { format: '⅝', match: '5/8' },
    { format: '⅞', match: '7/8' },
  ],
});

const legalRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '™', match: ['(tm)', '(TM)'] },
    { format: '®', match: ['(r)', '(R)'] },
    { format: '©', match: ['(c)', '(C)'] },
  ],
});

const legalHtmlRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '™', match: '&trade;' },
    { format: '®', match: '&reg;' },
    { format: '©', match: '&copy;' },
    { format: '§', match: '&sect;' },
  ],
});

const operatorsRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '±', match: '+-' },
    { format: '‰', match: '%%' },
    { format: '‱', match: ['%%%', '‰%'] },
  ],
});

const punctuationRule = createTextSubstitutionInputRule({
  patterns: [
    { format: '»', match: '>>' },
    { format: '«', match: '<<' },
  ],
});

const smartQuotesRule = createTextSubstitutionInputRule({
  patterns: [
    { format: ['“', '”'], match: '"' },
    { format: ['‘', '’'], match: "'" },
  ],
});

const degreeRule = createTextSubstitutionInputRule({
  patterns: [{ format: '°', match: '^o' }],
});

const AutoformatShortcutsPlugin = definePlugin('autoformatShortcuts', {
  inputRules: [
    legalRule,
    legalHtmlRule,
    arrowsRule,
    comparisonsRule,
    equalityRule,
    fractionsRule,
    operatorsRule,
    punctuationRule,
    smartQuotesRule,
    degreeRule,
  ],
});

export const AutoformatKit = [AutoformatShortcutsPlugin];
