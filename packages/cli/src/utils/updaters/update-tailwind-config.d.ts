import type { Config } from '@/src/utils/get-config';
import type { registryItemTailwindSchema } from '@/src/utils/registry/schema';
import type { Config as TailwindConfig } from 'tailwindcss';
import type { z } from 'zod';
import { type ObjectLiteralExpression } from 'ts-morph';
export type UpdaterTailwindConfig = Omit<TailwindConfig, 'plugins'> & {
    plugins?: string[];
};
export declare function updateTailwindConfig(tailwindConfig: z.infer<typeof registryItemTailwindSchema>['config'] | undefined, config: Config, options: {
    silent?: boolean;
}): Promise<void>;
export declare function transformTailwindConfig(input: string, tailwindConfig: UpdaterTailwindConfig, config: Config): Promise<string>;
export declare function _createSourceFile(input: string, config: Config | null): Promise<import("ts-morph").SourceFile>;
export declare function _getQuoteChar(configObject: ObjectLiteralExpression): "'" | "\"";
export declare function nestSpreadProperties(obj: ObjectLiteralExpression): void;
export declare function unnestSpreadProperties(obj: ObjectLiteralExpression): void;
export declare function buildTailwindThemeColorsFromCssVars(cssVars: Record<string, string>): Record<string, any>;
//# sourceMappingURL=update-tailwind-config.d.ts.map