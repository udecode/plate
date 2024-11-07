import { Command } from 'commander';
import { z } from 'zod';
export declare const registryMap: {
    magic: string;
    plate: string;
    shadcn: string;
};
export declare const initOptionsSchema: z.ZodObject<{
    components: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cwd: z.ZodString;
    defaults: z.ZodBoolean;
    force: z.ZodBoolean;
    isNewProject: z.ZodBoolean;
    name: z.ZodOptional<z.ZodString>;
    pm: z.ZodOptional<z.ZodEnum<["npm", "pnpm", "yarn", "bun"]>>;
    silent: z.ZodBoolean;
    srcDir: z.ZodOptional<z.ZodBoolean>;
    url: z.ZodOptional<z.ZodString>;
    yes: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    cwd: string;
    silent: boolean;
    defaults: boolean;
    force: boolean;
    isNewProject: boolean;
    yes: boolean;
    components?: string[] | undefined;
    url?: string | undefined;
    name?: string | undefined;
    pm?: "npm" | "pnpm" | "yarn" | "bun" | undefined;
    srcDir?: boolean | undefined;
}, {
    cwd: string;
    silent: boolean;
    defaults: boolean;
    force: boolean;
    isNewProject: boolean;
    yes: boolean;
    components?: string[] | undefined;
    url?: string | undefined;
    name?: string | undefined;
    pm?: "npm" | "pnpm" | "yarn" | "bun" | undefined;
    srcDir?: boolean | undefined;
}>;
export declare const init: Command;
export declare function runInit(options: z.infer<typeof initOptionsSchema> & {
    skipPreflight?: boolean;
}): Promise<{
    aliases: {
        components: string;
        utils: string;
        hooks?: string | undefined;
        lib?: string | undefined;
        ui?: string | undefined;
    };
    rsc: boolean;
    style: string;
    tailwind: {
        baseColor: string;
        config: string;
        css: string;
        cssVariables: boolean;
        prefix?: string | undefined;
    };
    tsx: boolean;
    resolvedPaths: {
        components: string;
        hooks: string;
        lib: string;
        ui: string;
        utils: string;
        cwd: string;
        tailwindConfig: string;
        tailwindCss: string;
    };
    url?: string | undefined;
    $schema?: string | undefined;
    name?: string | undefined;
    registries?: Record<string, {
        url: string;
        aliases?: {
            components?: string | undefined;
            hooks?: string | undefined;
            lib?: string | undefined;
            ui?: string | undefined;
            utils?: string | undefined;
        } | undefined;
        rsc?: boolean | undefined;
        style?: string | undefined;
        tailwind?: {
            baseColor?: string | undefined;
            config?: string | undefined;
            css?: string | undefined;
            cssVariables?: boolean | undefined;
            prefix?: string | undefined;
        } | undefined;
        tsx?: boolean | undefined;
    }> | undefined;
}>;
//# sourceMappingURL=init.d.ts.map