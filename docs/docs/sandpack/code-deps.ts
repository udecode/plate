export const commonDeps = {
  '@udecode/plate': '*',
  react: '17.0.2',
  'react-dom': '17.0.2',
  'react-scripts': '4.0.3',
  slate: '0.78.0',
  'slate-history': '0.66.0',
  'slate-hyperscript': '0.77.0',
  'slate-react': '0.79.0',
  'styled-components': '5.3.1',
  'react-dnd': '15.1.2',
  'react-dnd-html5-backend': '15.1.3',
};

export const plateTestUtilsDeps = {
  '@udecode/plate-test-utils': '*',
};

export const toolbarDeps = {
  '@styled-icons/boxicons-regular': '10.23.0',
  '@styled-icons/foundation': '10.28.0',
  '@styled-icons/material': '10.28.0',
  '@tippyjs/react': '4.2.5',
};

export const excalidrawDeps = {
  '@udecode/plate-ui-excalidraw': '*',
};

export const juiceDeps = {
  '@udecode/plate-juice': '*',
};

export const zustandDeps = {
  '@udecode/zustood': '1.1.1',
  zustand: '^3.7.2',
};

export const playgroundDeps = {
  ...commonDeps,
  ...plateTestUtilsDeps,
  ...toolbarDeps,
  ...excalidrawDeps,
  ...juiceDeps,
  ...zustandDeps,
};
