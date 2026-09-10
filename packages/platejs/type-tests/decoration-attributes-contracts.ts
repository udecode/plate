import { defineBasePlugin } from 'platejs';
import { definePlatePlugin, toPlatePlugin } from 'platejs/react';

const BasePaint = defineBasePlugin('basePaint', {
  decorate: {
    attributes: ({ decoration, entry, plugin, store }) => {
      decoration.key satisfies string;
      entry[1] satisfies readonly number[];
      plugin.name satisfies 'basePaint';
      store.get('color') satisfies string;
      // @ts-expect-error The callback preserves the exact store shape.
      store.get('missing');
      return { style: { color: store.get('color') } };
    },
    read: () => [],
  },
  initialState: { color: 'red' },
});

export const ConfiguredBasePaint = BasePaint.extend({
  decorate: { attributes: { className: 'base-paint' } },
})
  .extend(() => ({
    decorate: {
      attributes: ({ store }) => ({ style: { color: store.get('color') } }),
    },
  }))
  .configure({ decorate: { attributes: null } });

BasePaint.configure({
  decorate: {
    attributes: ({ store }) => ({ 'data-color': store.get('color') }),
  },
});

export const ReactPaint = definePlatePlugin('reactPaint', {
  decorate: {
    attributes: ({ decoration, editor, entry, plugin, store }) => {
      decoration.key satisfies string;
      entry[1] satisfies readonly number[];
      editor.api.dom;
      plugin.name satisfies 'reactPaint';
      store.get('color') satisfies string;
      // @ts-expect-error The callback preserves the exact store shape.
      store.get('missing');
      return { className: 'react-paint' };
    },
    read: () => [],
  },
  initialState: { color: 'red' },
})
  .extend({
    decorate: {
      attributes: ({ editor, store }) => {
        editor.api.dom;
        return { style: { color: store.get('color') } };
      },
    },
  })
  .extend(() => ({
    decorate: {
      attributes: ({ store }) => ({ 'data-color': store.get('color') }),
    },
  }))
  .configure({
    decorate: { attributes: { className: 'configured' } },
  });

export const ConvertedPaint = toPlatePlugin(BasePaint).configure({
  decorate: {
    attributes: ({ editor, store }) => {
      editor.api.dom;
      return { 'aria-label': store.get('color') };
    },
  },
});

defineBasePlugin('missingBaseReader', {
  // @ts-expect-error A new decoration capability requires a semantic reader.
  decorate: { attributes: { className: 'paint' } },
});
definePlatePlugin('missingReactReader', {
  // @ts-expect-error A new decoration capability requires a semantic reader.
  decorate: { attributes: null },
});
defineBasePlugin('noBasePaint', {}).extend({
  // @ts-expect-error A stage introducing decorations must supply a reader.
  decorate: { attributes: { className: 'paint' } },
});
definePlatePlugin('noReactPaint', {}).extend({
  // @ts-expect-error A stage introducing decorations must supply a reader.
  decorate: { attributes: { className: 'paint' } },
});
BasePaint.configure({
  decorate: {
    attributes: {
      // @ts-expect-error Presentation cannot install event handlers.
      onClick() {},
    },
  },
});
BasePaint.configure({
  decorate: {
    attributes: {
      // @ts-expect-error Presentation cannot introduce inline markup.
      children: 'text',
    },
  },
});
