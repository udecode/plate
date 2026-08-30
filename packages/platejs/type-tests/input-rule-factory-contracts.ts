import {
  type InputRuleEditor,
  type InsertTextInputRule,
  type MarkInputRuleMatch,
  createRuleFactory,
} from 'platejs';

const markRule = createRuleFactory<{}, { variant: '*' | '_' }>({
  type: 'mark',
  variant: '*',
  start: ({ variant }) => variant,
  trigger: ({ variant }) => variant,
});

markRule();
markRule({ priority: 10 });
markRule({ variant: '_' });

// @ts-expect-error Declared factory defaults stay exact.
markRule({ variant: '~' });

const ruleWithoutOptions = createRuleFactory({
  type: 'mark',
  start: '`',
  trigger: '`',
});

ruleWithoutOptions();
ruleWithoutOptions({ priority: 10 });

// @ts-expect-error Rule-definition fields never leak into consumer options.
ruleWithoutOptions({ start: '_' });

const requiredMarkRule = createRuleFactory<{ value: 'sub' | 'sup' }>({
  type: 'mark',
  start: ({ value }) => (value === 'sub' ? '~' : '^'),
  trigger: ({ value }) => (value === 'sub' ? '~' : '^'),
  value: ({ value }) => value,
});

requiredMarkRule({ value: 'sub' });

// @ts-expect-error Required factory options cannot be omitted.
requiredMarkRule();

const exactMarkRule: InsertTextInputRule<MarkInputRuleMatch, InputRuleEditor> =
  markRule();

void exactMarkRule;
