import { definePlugin } from '../src/lib/plugin/definePlugin';

const SelectorPlugin = definePlugin('selectorPlugin', {
  initialState: { value: 2 },
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
