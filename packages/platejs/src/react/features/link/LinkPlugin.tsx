import type { DefinitionOf } from '../../../core';
import { BaseLinkPlugin } from '../../../features/link/lib';
import { toReactPlugin } from '../../core';

/** Enables support for hyperlinks. */
export const LinkPlugin = toReactPlugin(BaseLinkPlugin);

export type LinkDefinition = DefinitionOf<typeof LinkPlugin>;
