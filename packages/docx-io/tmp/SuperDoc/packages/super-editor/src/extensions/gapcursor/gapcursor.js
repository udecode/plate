import { gapCursor } from 'prosemirror-gapcursor';
import { Extension } from '@core/index.js';
import { callOrGet } from '@core/utilities/callOrGet.js';
import { getExtensionConfigField } from '@core/helpers/getExtensionConfigField.js';

export const Gapcursor = Extension.create({
  name: 'gapCursor',

  addPmPlugins() {
    return [gapCursor()];
  },

  extendNodeSchema(extension) {
    return {
      allowGapCursor:
        callOrGet(
          getExtensionConfigField(extension, 'allowGapCursor', {
            name: extension.name,
            options: extension.options,
            storage: extension.storage,
          }),
        ) ?? null,
    };
  },
});
