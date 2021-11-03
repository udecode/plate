import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import {
  MARK_BG_COLOR,
  MARK_COLOR,
  MARK_FONT_FAMILY,
  MARK_FONT_SIZE,
  MARK_FONT_WEIGHT,
} from '@udecode/plate-font';

export const getHandledMarks = (editor: SPEditor): string[] => {
  return [
    getPlatePluginType(editor, MARK_BOLD),
    getPlatePluginType(editor, MARK_ITALIC),
    getPlatePluginType(editor, MARK_UNDERLINE),
    getPlatePluginType(editor, MARK_STRIKETHROUGH),
    getPlatePluginType(editor, MARK_FONT_SIZE),
    getPlatePluginType(editor, MARK_FONT_FAMILY),
    getPlatePluginType(editor, MARK_FONT_WEIGHT),
    getPlatePluginType(editor, MARK_COLOR),
    getPlatePluginType(editor, MARK_BG_COLOR),
  ];
};
