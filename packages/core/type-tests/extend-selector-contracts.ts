import { createBasePlugin } from '../src/lib/plugin/createBasePlugin';

const SelectorPlugin = createBasePlugin({
  initialState: { value: 2 },
  name: 'selectorPlugin',
}).extend(({ store }) => ({
  selectors: {
    multiplied: (state) => state.value + store.get().value,
  },
}));

const selectorResult: number = SelectorPlugin.selectors.multiplied({
  value: 2,
});

// @ts-expect-error Callback stages preserve exact selector keys.
void SelectorPlugin.selectors.missing;

void selectorResult;
