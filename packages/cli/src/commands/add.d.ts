import { Command } from 'commander';
import { z } from 'zod';
export declare const addOptionsSchema: z.ZodObject<{
    all: z.ZodBoolean;
    components: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cwd: z.ZodString;
    list: z.ZodOptional<z.ZodBoolean>;
    overwrite: z.ZodBoolean;
    path: z.ZodOptional<z.ZodString>;
    registry: z.ZodOptional<z.ZodString>;
    silent: z.ZodBoolean;
    srcDir: z.ZodOptional<z.ZodBoolean>;
    yes: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    silent: boolean;
    yes: boolean;
    overwrite: boolean;
    all: boolean;
    components?: string[] | undefined;
    path?: string | undefined;
    srcDir?: boolean | undefined;
    list?: boolean | undefined;
    registry?: string | undefined;
}, {
    cwd: string;
    silent: boolean;
    yes: boolean;
    overwrite: boolean;
    all: boolean;
    components?: string[] | undefined;
    path?: string | undefined;
    srcDir?: boolean | undefined;
    list?: boolean | undefined;
    registry?: string | undefined;
}>;
export declare const add: Command;
//# sourceMappingURL=add.d.ts.map