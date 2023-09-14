import { createPlugins, Plate, PlateProvider } from '@udecode/plate-common';

const plugins = createPlugins([], {
  components: {},
});

const initialValue = [
  {
    id: 1,
    type: 'p',
    children: [{ text: 'Hello, World!' }],
  },
];

export function PlateEditor() {
  return (
    <PlateProvider plugins={plugins} initialValue={initialValue}>
      <Plate />
    </PlateProvider>
  );
}
