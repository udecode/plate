import { BaseIndentPlugin } from '../../../features/indent/lib/BaseIndentPlugin';
import { toPlatePlugin } from '../../core';

export const IndentPlugin = toPlatePlugin(BaseIndentPlugin);
