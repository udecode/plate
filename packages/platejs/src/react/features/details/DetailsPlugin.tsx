import { BaseParagraphPlugin } from '../../../core';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from '../../../features/details/lib';
import { toReactPlugin } from '../../core';

export const DetailsSummaryPlugin = toReactPlugin(BaseDetailsSummaryPlugin);

export const DetailsPlugin = toReactPlugin(BaseDetailsPlugin, {
  dependencies: [DetailsSummaryPlugin, BaseParagraphPlugin],
});
