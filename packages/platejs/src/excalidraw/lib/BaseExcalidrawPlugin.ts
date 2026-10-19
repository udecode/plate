import {
  definePlugin,
  type ElementOf,
  property,
  type EditorJsonValue,
  PLUGINS,
} from '../../core';

type ExcalidrawElementData = {
  elements: readonly EditorJsonValue[];
  files?: Readonly<Record<string, EditorJsonValue>>;
  state: Readonly<Record<string, EditorJsonValue>>;
} | null;

const isJsonRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Stores an Excalidraw scene in a void block. */
export const BaseExcalidrawPlugin = definePlugin(PLUGINS.excalidraw, {
  schema: {
    element: {
      properties: {
        data: property.json({
          validate: (value): value is ExcalidrawElementData =>
            value === null ||
            (isJsonRecord(value) &&
              Array.isArray(value.elements) &&
              isJsonRecord(value.state) &&
              (!('files' in value) || isJsonRecord(value.files))),
          validationVersion: 2,
        }),
      },
      void: 'block',
    },
  },
});

export type ExcalidrawElement = ElementOf<typeof BaseExcalidrawPlugin>;
