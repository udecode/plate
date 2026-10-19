import type { NodeKey } from '../../../facade';
import type { ViewElementAttributes } from '../../plugin/PlatePlugin';

export type NavigationFeedbackPluginState = {
  /** Default feedback duration in milliseconds. */
  duration: number;
};

export type NavigationFlashTargetOptions = {
  /** Live element identity in the current mounted view. */
  key: NodeKey;
  /** Safe whole-element presentation; lifecycle markers remain plugin-owned. */
  attributes?: ViewElementAttributes;
  /** Override the configured duration in milliseconds. */
  duration?: number;
};
