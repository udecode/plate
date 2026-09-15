import { createEditor, definePlugin as defineHeadlessPlugin } from 'platejs';
import { definePlugin, toReactPlugin } from 'platejs/react';

type OptionalState = { value?: string };
type UndefinedState = { value: string | undefined };
type NullableState = {
  nested: { label?: string };
  value: string | null;
};

const optionalState: OptionalState = {};
const undefinedState: UndefinedState = { value: undefined };
const nullableState: NullableState = { nested: {}, value: null };
declare const unknownValue: unknown;

defineHeadlessPlugin('optionalBaseState', {
  // @ts-expect-error Every declared store field needs an initial value.
  initialState: optionalState,
});
defineHeadlessPlugin('optionalBaseFactoryState', {
  // @ts-expect-error A factory cannot omit declared store fields.
  initialState: (): OptionalState => ({}),
});
defineHeadlessPlugin('undefinedBaseState', {
  // @ts-expect-error Use null for an empty store field.
  initialState: undefinedState,
});
defineHeadlessPlugin('undefinedBaseFactoryState', {
  // @ts-expect-error Factory state must also exclude undefined.
  initialState: () => ({ value: undefined }),
});
defineHeadlessPlugin('missingBaseFactoryState', {
  // @ts-expect-error An initial-state factory must return a state record.
  initialState: () => undefined,
});
defineHeadlessPlugin('unknownBaseState', {
  // @ts-expect-error Unknown includes undefined and is not a concrete field type.
  initialState: { value: unknownValue },
});

definePlugin('optionalPlateState', {
  // @ts-expect-error Every declared store field needs an initial value.
  initialState: optionalState,
});
definePlugin('optionalPlateFactoryState', {
  // @ts-expect-error A factory cannot omit declared store fields.
  initialState: (): OptionalState => ({}),
});
definePlugin('undefinedPlateState', {
  // @ts-expect-error Use null for an empty store field.
  initialState: undefinedState,
});
definePlugin('undefinedPlateFactoryState', {
  // @ts-expect-error Factory state must also exclude undefined.
  initialState: () => ({ value: undefined }),
});
definePlugin('missingPlateFactoryState', {
  // @ts-expect-error An initial-state factory must return a state record.
  initialState: () => undefined,
});

const Base = defineHeadlessPlugin('completeBaseState', {
  initialState: nullableState,
}).extend(({ store }) => {
  store.get('value') satisfies string | null;
  store.get('nested').label satisfies string | undefined;
  // @ts-expect-error Contextual state inference must retain the exact keys.
  store.get('missing');

  return { initialState: { count: 0 } };
});

const EditorRoot = definePlugin('completePlateState', {
  initialState: (): NullableState => nullableState,
}).extend(({ store }) => {
  store.get('value') satisfies string | null;
  // @ts-expect-error Factory state must retain the exact contextual keys.
  store.get('missing');

  return { initialState: { count: 0 } };
});

// @ts-expect-error Plugin stages cannot introduce optional store fields.
Base.extend({ initialState: optionalState });
// @ts-expect-error Contextual stages cannot introduce undefined store fields.
Base.extend(() => ({ initialState: { added: undefined } }));
// @ts-expect-error Plugin stage factories cannot introduce optional store fields.
Base.extend({ initialState: (): OptionalState => ({}) });
// @ts-expect-error Contextual plugin stage factories cannot omit declared fields.
Base.extend(() => ({ initialState: (): OptionalState => ({}) }));
// @ts-expect-error React stages cannot introduce optional store fields.
EditorRoot.extend({ initialState: optionalState });
// @ts-expect-error React contextual stages cannot introduce undefined fields.
EditorRoot.extend(() => ({ initialState: { added: undefined } }));
// @ts-expect-error React plugin stage factories need complete state.
EditorRoot.extend({ initialState: (): OptionalState => ({}) });
// @ts-expect-error React contextual plugin stage factories need complete state.
EditorRoot.extend(() => ({ initialState: (): OptionalState => ({}) }));
// @ts-expect-error The React adapter retains the same state contract.
toReactPlugin(Base).extend({ initialState: optionalState });

Base.configure({ initialState: { value: 'configured' } });
EditorRoot.configure(({ store }) => ({
  initialState: { count: store.get('count') + 1 },
}));
Base.extend({ initialState: { value: 'extended' } });
EditorRoot.extend({ initialState: { value: null } });

const editor = createEditor({ plugins: [Base, EditorRoot] });
editor.plugin(Base).store.set({ value: null });
editor.plugin(Base).store.set((state) => {
  // @ts-expect-error Draft writes preserve the non-undefined state contract.
  state.value = undefined;
});
editor.plugin(EditorRoot).store.get('count') satisfies number;

defineHeadlessPlugin('statelessBase', {});
definePlugin('statelessPlate', {});
