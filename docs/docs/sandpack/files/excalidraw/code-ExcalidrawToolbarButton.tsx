export const excalidrawToolbarButtonCode = `import React from 'react';
import { Pencil } from '@styled-icons/boxicons-regular';
import { ExcalidrawToolbarButton } from '@udecode/plate-ui-excalidraw';

export const ExcalidrawElementToolbarButton = () => {
  return <ExcalidrawToolbarButton icon={<Pencil />} />;
};
`;

export const excalidrawToolbarButtonFile = {
  '/excalidraw/ExcalidrawToolbarButton.tsx': excalidrawToolbarButtonCode,
};
