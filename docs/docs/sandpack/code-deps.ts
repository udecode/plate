import {
  cloudUiVersion,
  cloudVersion,
  dndUiVersion,
  dndVersion,
  excalidrawVersion,
  juiceVersion,
  plateVersion,
  selectionVersion,
  testUtilsVersion,
} from './plate-versions';

export const plateTestUtilsDeps = {
  '@udecode/plate-test-utils': testUtilsVersion,
};

export const excalidrawDeps = {
  '@udecode/plate-excalidraw': excalidrawVersion,
};

export const juiceDeps = {
  '@udecode/plate-juice': juiceVersion,
};

export const selectionDeps = {
  '@udecode/plate-selection': selectionVersion,
};

export const cloudDeps = {
  '@udecode/plate-cloud': cloudVersion,
  '@udecode/plate-ui-cloud': cloudUiVersion,
};

export const dndDeps = {
  '@udecode/plate-dnd': dndVersion,
  '@udecode/plate-ui-dnd': dndUiVersion,
  'react-dnd': '15.1.2',
  'react-dnd-html5-backend': '15.1.3',
};

export const commonDeps = {
  '@udecode/plate': plateVersion,
  nanoid: '3.3.4',
  react: '17.0.2',
  'react-dom': '17.0.2',
  'react-scripts': '4.0.3',
  slate: '0.90.0',
  'slate-history': '0.86.0',
  'slate-hyperscript': '0.77.0',
  'slate-react': '0.90.0',
  'styled-components': '5.3.1',
};

export const toolbarDeps = {
  '@styled-icons/boxicons-regular': '10.23.0',
  '@styled-icons/foundation': '10.28.0',
  '@styled-icons/material': '10.28.0',
  '@tippyjs/react': '4.2.5',
};

export const playgroundDeps = {
  ...commonDeps,
  ...plateTestUtilsDeps,
  ...toolbarDeps,
  ...excalidrawDeps,
  ...juiceDeps,
  ...selectionDeps,
  ...dndDeps,
};
