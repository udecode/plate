import type { DefinitionOf } from '../../../core';
import { BaseLinkPlugin } from '../../../features/link/lib';
import { toPlatePlugin } from '../../core';

/** Enables support for hyperlinks. */
export const LinkPlugin = toPlatePlugin(BaseLinkPlugin);

export type LinkDefinition = DefinitionOf<typeof LinkPlugin>;
