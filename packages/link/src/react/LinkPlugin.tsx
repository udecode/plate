import type { DefinitionOf } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';

import { BaseLinkPlugin } from '../lib';

/** Enables support for hyperlinks. */
export const LinkPlugin = toPlatePlugin(BaseLinkPlugin);

export type LinkDefinition = DefinitionOf<typeof LinkPlugin>;
