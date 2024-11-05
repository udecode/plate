import type { registryBaseColorSchema } from '@/src/utils/registry/schema';
import type { Transformer } from '@/src/utils/transformers';
import type { z } from 'zod';
export declare const transformCssVars: Transformer;
export declare function splitClassName(className: string): (string | null)[];
export declare function applyColorMapping(input: string, mapping: z.infer<typeof registryBaseColorSchema>['inlineColors']): string;
//# sourceMappingURL=transform-css-vars.d.ts.map