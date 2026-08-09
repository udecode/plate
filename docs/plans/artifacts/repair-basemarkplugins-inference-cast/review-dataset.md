# BaseMarkPlugins inference repair review dataset

Review only these current-checkout files:

- `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts`
- `packages/core/src/lib/plugins/input-rules/types.ts`
- `packages/core/type-tests/input-rule-factory-contracts.ts`
- `packages/basic-nodes/src/lib/BaseMarkPlugins.ts`
- `packages/basic-nodes/src/lib/BaseHeadingPlugins.ts`
- `packages/basic-nodes/src/lib/BaseBlockPlugins.ts`
- `.changeset/plugin-portal-scoped-api.md` lines 25-32

The package files previously cast exported rule objects to manually written
`InputRuleFactory` shapes. Eleven casts across mark, heading, and block rule
families hid a declaration-emission failure and erased the exact rule family.

The repair removes every such cast and fixes the shared factory boundary:

- unbound factories use the public `InputRuleEditor` declaration carrier
  instead of leaking Core's private installed-plugin editor type;
- `InputRuleFactory` retains its first four generic parameters and accepts an
  exact, constrained rule result as its fifth parameter;
- `NoInfer<TDefaults>` prevents rule-definition fields from becoming consumer
  options while preserving explicitly declared defaults;
- required options remain required, optional defaults remain optional, and
  mark factories return `InsertTextInputRule<MarkInputRuleMatch, InputRuleEditor>`;
- plugin-bound factories retain their exact plugin editor context.

Verification already passed:

- Core and Basic Nodes source-first Turbo typecheck: 13/13 tasks
- Core and Basic Nodes declaration builds
- five focused Core/Basic Nodes test files: 54/54 tests
- zero `InputRuleFactory` result casts in Basic Nodes source
- zero `InternalBaseEditorWithInstalledPlugins` references in Basic Nodes
  emitted declarations

Ignore all unrelated dirty-checkout changes. Inspect the listed source files
directly and report only concrete regressions introduced by this repair.
