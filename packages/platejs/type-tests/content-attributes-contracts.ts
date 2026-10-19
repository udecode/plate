import { definePlugin as defineHeadlessPlugin } from 'platejs';
import { definePlugin, toReactPlugin } from 'platejs/react';

const BasePaint = defineHeadlessPlugin('baseContentPaint', {
  initialState: { color: 'red' },
  render: {
    contentAttributes: {
      className: 'paint',
      style: { color: 'red' },
      'aria-label': 'Content',
      'data-feature': true,
    },
  },
});
export const ConfiguredBasePaint = BasePaint.configure(({ store }) => ({
  render: { contentAttributes: { style: { color: store.get('color') } } },
}));
export const ClearedBasePaint = BasePaint.configure({
  render: { contentAttributes: null },
});
export const ReactPaint = toReactPlugin(BasePaint).configure({
  render: { contentAttributes: { className: 'react-paint' } },
});
export const DirectReactPaint = definePlugin('reactContentPaint', {
  render: { contentAttributes: { style: { color: 'green' } } },
}).extend({ render: { contentAttributes: { 'data-mode': 'review' } } });

BasePaint.configure({
  render: {
    contentAttributes: {
      // @ts-expect-error Content presentation cannot own input behavior.
      onClick() {},
    },
  },
});
BasePaint.configure({
  render: {
    contentAttributes: {
      // @ts-expect-error Content presentation cannot replace editor children.
      children: 'text',
    },
  },
});
BasePaint.configure({
  render: {
    contentAttributes: {
      // @ts-expect-error Content presentation cannot capture the editor ref.
      ref: { current: null },
    },
  },
});
toReactPlugin(BasePaint).configure({
  render: {
    contentAttributes: {
      // @ts-expect-error The content root owns its editable state.
      contentEditable: false,
    },
  },
});
toReactPlugin(BasePaint).configure({
  render: {
    // @ts-expect-error Static content attributes do not install a render callback.
    contentAttributes: () => ({ className: 'dynamic' }),
  },
});
