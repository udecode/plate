import {
  Plate,
  createPlugins,
  createTablePlugin,
  createPlateUI,
} from '@udecode/plate';

const plugins = createPlugins([
  createTablePlugin(),
], {
  components: createPlateUI(),
});

const initialValue = [
  {
    type: 'table',
    children: [
      {
        type: 'tr',
        children: [
          {
            type: 'th',
            children: [{ text: 'Row 1, Cell 1' }],
          },
          {
            type: 'th',
            children: [{ text: 'Row 1, Cell 2' }],
          },
        ],
      },
      {
        type: 'tr',
        children: [
          {
            type: 'td',
            children: [{ text: 'Row 2, Cell 1' }],
          },
          {
            type: 'td',
            children: [{ text: 'Row 2, Cell 2' }],
          },
        ],
      },
    ],
  },
];


export const App = () => {
  return <Plate plugins={plugins} initialValue={initialValue} />;
};
