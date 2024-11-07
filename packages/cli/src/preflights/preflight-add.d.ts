import type { addOptionsSchema } from '@/src/commands/add';
import type { z } from 'zod';
export declare function preFlightAdd(options: z.infer<typeof addOptionsSchema>): Promise<{
    config: null;
    errors: Record<string, boolean>;
} | {
    config: {
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
    };
    errors: Record<string, boolean>;
}>;
//# sourceMappingURL=preflight-add.d.ts.map