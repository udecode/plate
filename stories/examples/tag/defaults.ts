import { TagElement } from './components/TagElement';
import { TagKeyOption, TagPluginOptionsValues } from './types';

export const ELEMENT_TAG = 'tag';

export const DEFAULTS_TAG: Record<TagKeyOption, TagPluginOptionsValues> = {
  tag: {
    component: TagElement,
    type: ELEMENT_TAG,
    rootProps: {
      className: 'slate-tag',
    },
  },
};
