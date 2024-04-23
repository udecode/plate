const plateOverrides = {
  alignment: 'plate-alignment',
  autoformat: 'plate-autoformat',
  'basic-elements': 'plate-basic-elements',
  'basic-marks': 'plate-basic-marks',
  'block-selection': 'plate-selection',
  caption: 'plate-caption',
  cloud: 'plate-cloud',
  collaboration: 'plate-yjs',
  combobox: 'plate-combobox',
  comments: 'plate-comments',
  column: 'plate-column',
  dnd: 'plate-dnd',
  emoji: 'plate-emoji',
  excalidraw: 'plate-excalidraw',
  'exit-break': 'plate-break',
  'find-replace': 'plate-find-replace',
  font: 'plate-font',
  'forced-layout': 'plate-normalizers',
  highlight: 'plate-highlight',
  'horizontal-rule': 'plate-horizontal-rule',
  indent: 'plate-indent',
  'indent-list': 'plate-indent-list',
  'line-height': 'plate-line-height',
  link: 'plate-link',
  list: 'plate-list',
  media: 'plate-media',
  mention: 'plate-mention',
  'reset-node': 'plate-reset-node',
  resizable: 'plate-resizable',
  'serializing-csv': 'plate-serializer-csv',
  'serializing-docx': 'plate-serializer-docx',
  'serializing-html': 'plate-serializer-html',
  'serializing-md': 'plate-serializer-md',
  'single-line': 'plate-break',
  'soft-break': 'plate-break',
  tabbable: 'plate-tabbable',
  table: 'plate-table',
  toggle: 'plate-toggle',
};

export const docToPackage = (name?: string) => {
  if (name && name in plateOverrides) {
    const packageName: string = (plateOverrides as any)[name];
    return {
      name: packageName,
      sourcePath: packageName.replace('plate-', ''),
    };
  }
};
