import type { PluginConfig } from '@platejs/core';

export type MediaPluginOptions = {
  isUrl?: (text: string) => boolean;

  /** Transforms the url. */
  transformUrl?: (url: string) => string;
};

export type MediaPluginConfig = PluginConfig<string, MediaPluginOptions>;
