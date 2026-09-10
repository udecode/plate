import { BaseParagraphPlugin } from '../../../core';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../../../features/details/lib';
import { toPlatePlugin } from '../../core';

export const DetailsSummaryPlugin = toPlatePlugin(BaseDetailsSummaryPlugin);

export const DetailsPlugin = toPlatePlugin(BaseDetailsPlugin, {
  dependencies: [DetailsSummaryPlugin, BaseParagraphPlugin],
});
