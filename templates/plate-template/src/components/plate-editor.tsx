import { createPlugins, Plate } from '@udecode/plate-common';

const plugins = createPlugins([], {
  components: {},
});

const initialValue = [
  {
    type: 'p',
    children: [{ text: 'Hello, World!' }],
  },
];

export function PlateEditor() {
  return <Plate plugins={plugins} initialValue={initialValue} />;
}
