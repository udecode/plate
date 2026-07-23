import type { PluginConfig } from '@platejs/core';
import {
  definePropertyPolicy,
  property,
  type SchemaElementProperties,
} from '@platejs/plite';

export const mediaElementProperties = {
  isUpload: property.boolean(),
  name: property.string(),
  placeholderId: property.string(),
  url: property.string(),
  width: property.json({
    policy: definePropertyPolicy<number | string>({
      id: 'plate.media.width',
      validate: (value): value is number | string =>
        (typeof value === 'number' && Number.isFinite(value)) ||
        typeof value === 'string',
      version: 1,
    }),
  }),
} satisfies SchemaElementProperties;

export type MediaPluginOptions = {
  isUrl?: (text: string) => boolean;

  /** Transforms the url. */
  transformUrl?: (url: string) => string;
};

export type MediaPluginConfig = PluginConfig<string, MediaPluginOptions>;
