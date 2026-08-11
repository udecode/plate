import type { ImportedDataState } from '@excalidraw/excalidraw/data/types';

import { defineBasePlugin } from '@platejs/core';
import {
  type ElementOf,
  property,
  type PropertyJsonValue,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export type ExcalidrawDataState = ImportedDataState;

type ExcalidrawElementData = {
  elements: readonly PropertyJsonValue[];
  state: Readonly<Record<string, PropertyJsonValue>>;
} | null;

/** Enables support for Excalidraw drawing tool within a Slate document */
export const BaseExcalidrawPlugin = defineBasePlugin(PLUGINS.excalidraw, {
  schema: {
    element: {
      properties: {
        data: property.json({
          validate: (value): value is ExcalidrawElementData =>
            value === null ||
            (typeof value === 'object' &&
              !Array.isArray(value) &&
              value !== null &&
              'elements' in value &&
              Array.isArray(value.elements) &&
              'state' in value &&
              typeof value.state === 'object' &&
              !Array.isArray(value.state) &&
              value.state !== null),
          validationVersion: 1,
        }),
        width: property.string(),
      },
      void: 'block',
    },
  },
});

export type ExcalidrawElement = ElementOf<typeof BaseExcalidrawPlugin>;
