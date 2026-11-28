import type { Editor } from '../../../core';
import { BaseBoardGeoPlugin } from './BaseBoardGeoPlugin';
import { BaseBoardImagePlugin } from './BaseBoardImagePlugin';
import { BaseBoardNotePlugin } from './BaseBoardNotePlugin';
import { BaseBoardStrokePlugin } from './BaseBoardStrokePlugin';
import { BaseBoardTextPlugin } from './BaseBoardTextPlugin';

export const boardTypesOf = (editor: Editor) => {
  const geo = editor.plugin(BaseBoardGeoPlugin);
  const image = editor.plugin(BaseBoardImagePlugin);
  const note = editor.plugin(BaseBoardNotePlugin);
  const stroke = editor.plugin(BaseBoardStrokePlugin);
  const text = editor.plugin(BaseBoardTextPlugin);

  return {
    geo: () => (geo.installed ? geo.schema.type : undefined),
    image: () => (image.installed ? image.schema.type : undefined),
    note: () => (note.installed ? note.schema.type : undefined),
    stroke: () => (stroke.installed ? stroke.schema.type : undefined),
    text: () => (text.installed ? text.schema.type : undefined),
  };
};

export type BoardTypes = ReturnType<typeof boardTypesOf>;
