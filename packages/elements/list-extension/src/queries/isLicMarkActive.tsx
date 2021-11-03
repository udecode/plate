import { TEditor } from '@udecode/plate-core';
import { LicSelection } from '../atoms/licSelection';
import { hasLicMark } from './hasLicMark';

export const isLicMarkActive = (
  editor: TEditor,
  licSelection: LicSelection,
  key: string
): boolean => !!hasLicMark(editor, licSelection, key);
