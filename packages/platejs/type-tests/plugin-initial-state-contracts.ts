import { createEditor, defineBasePlugin } from 'platejs';
import { definePlatePlugin, toPlatePlugin } from 'platejs/react';

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

defineBasePlugin('optionalBaseState', {
  // @ts-expect-error Every declared store field needs an initial value.
  initialState: optionalState,
});
defineBasePlugin('optionalBaseFactoryState', {
  // @ts-expect-error A factory cannot omit declared store fields.
  initialState: (): OptionalState => ({}),
});
defineBasePlugin('undefinedBaseState', {
  // @ts-expect-error Use null for an empty store field.
  initialState: undefinedState,
});
defineBasePlugin('undefinedBaseFactoryState', {
  // @ts-expect-error Factory state must also exclude undefined.
  initialState: () => ({ value: undefined }),
});
defineBasePlugin('missingBaseFactoryState', {
  // @ts-expect-error An initial-state factory must return a state record.
  initialState: () => undefined,
});
defineBasePlugin('unknownBaseState', {
  // @ts-expect-error Unknown includes undefined and is not a concrete field type.
  initialState: { value: unknownValue },
});

definePlatePlugin('optionalPlateState', {
  // @ts-expect-error Every declared store field needs an initial value.
  initialState: optionalState,
});
definePlatePlugin('optionalPlateFactoryState', {
  // @ts-expect-error A factory cannot omit declared store fields.
  initialState: (): OptionalState => ({}),
});
definePlatePlugin('undefinedPlateState', {
  // @ts-expect-error Use null for an empty store field.
  initialState: undefinedState,
});
definePlatePlugin('undefinedPlateFactoryState', {
  // @ts-expect-error Factory state must also exclude undefined.
  initialState: () => ({ value: undefined }),
});
definePlatePlugin('missingPlateFactoryState', {
  // @ts-expect-error An initial-state factory must return a state record.
  initialState: () => undefined,
});

const Base = defineBasePlugin('completeBaseState', {
  initialState: nullableState,
}).extend(({ store }) => {
  store.get('value') satisfies string | null;
  store.get('nested').label satisfies string | undefined;
  // @ts-expect-error Contextual state inference must retain the exact keys.
  store.get('missing');

  return { initialState: { count: 0 } };
});

const Plate = definePlatePlugin('completePlateState', {
  initialState: (): NullableState => nullableState,
}).extend(({ store }) => {
  store.get('value') satisfies string | null;
  // @ts-expect-error Factory state must retain the exact contextual keys.
  store.get('missing');

  return { initialState: { count: 0 } };
});

// @ts-expect-error Extension stages cannot introduce optional store fields.
Base.extend({ initialState: optionalState });
// @ts-expect-error Contextual stages cannot introduce undefined store fields.
Base.extend(() => ({ initialState: { added: undefined } }));
// @ts-expect-error Extension factories cannot introduce optional store fields.
Base.extend({ initialState: (): OptionalState => ({}) });
// @ts-expect-error Contextual extension factories cannot omit declared fields.
Base.extend(() => ({ initialState: (): OptionalState => ({}) }));
// @ts-expect-error React stages cannot introduce optional store fields.
Plate.extend({ initialState: optionalState });
// @ts-expect-error React contextual stages cannot introduce undefined fields.
Plate.extend(() => ({ initialState: { added: undefined } }));
// @ts-expect-error React extension factories need complete state.
Plate.extend({ initialState: (): OptionalState => ({}) });
// @ts-expect-error React contextual extension factories need complete state.
Plate.extend(() => ({ initialState: (): OptionalState => ({}) }));
// @ts-expect-error The React adapter retains the same state contract.
toPlatePlugin(Base).extend({ initialState: optionalState });

Base.configure({ initialState: { value: 'configured' } });
Plate.configure(({ store }) => ({
  initialState: { count: store.get('count') + 1 },
}));
Base.extend({ initialState: { value: 'extended' } });
Plate.extend({ initialState: { value: null } });

const editor = createEditor({ plugins: [Base, Plate] });
editor.plugin(Base).store.set({ value: null });
editor.plugin(Base).store.set((state) => {
  // @ts-expect-error Draft writes preserve the non-undefined state contract.
  state.value = undefined;
});
editor.plugin(Plate).store.get('count') satisfies number;

defineBasePlugin('statelessBase', {});
definePlatePlugin('statelessPlate', {});
