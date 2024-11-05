import type { Config } from '@/src/utils/get-config';
import type { registryItemCssVarsSchema } from '@/src/utils/registry/schema';
import type { z } from 'zod';
export declare function updateCssVars(cssVars: z.infer<typeof registryItemCssVarsSchema> | undefined, config: Config, options: {
    cleanupDefaultNextStyles?: boolean;
    registryName?: string;
    silent?: boolean;
}): Promise<void>;
export declare function transformCssVars(input: string, cssVars: z.infer<typeof registryItemCssVarsSchema>, config: Config, options: {
    cleanupDefaultNextStyles?: boolean;
    registryName?: string;
}): Promise<string>;
//# sourceMappingURL=update-css-vars.d.ts.map