import type { Editor } from '../../../core';
import { BaseBoardGeoPlugin } from './BaseBoardGeoPlugin';
import { BaseBoardNotePlugin } from './BaseBoardNotePlugin';
import { BaseBoardStrokePlugin } from './BaseBoardStrokePlugin';

export const boardTypesOf = (editor: Editor) => {
  const geo = editor.plugin(BaseBoardGeoPlugin);
  const note = editor.plugin(BaseBoardNotePlugin);
  const stroke = editor.plugin(BaseBoardStrokePlugin);

  return {
    geo: () => (geo.installed ? geo.schema.type : undefined),
    note: () => (note.installed ? note.schema.type : undefined),
    stroke: () => (stroke.installed ? stroke.schema.type : undefined),
  };
};

export type BoardTypes = ReturnType<typeof boardTypesOf>;
