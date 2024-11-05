import type { initOptionsSchema } from '@/src/commands/init';
import type { z } from 'zod';
export declare function preFlightInit(options: z.infer<typeof initOptionsSchema>): Promise<{
    errors: Record<string, boolean>;
    projectInfo: null;
} | {
    errors: Record<string, boolean>;
    projectInfo: {
        aliasPrefix: string | null;
        framework: import("../utils/frameworks").Framework;
        isRSC: boolean;
        isSrcDir: boolean;
        isTsx: boolean;
        tailwindConfigFile: string | null;
        tailwindCssFile: string | null;
    };
}>;
//# sourceMappingURL=preflight-init.d.ts.map