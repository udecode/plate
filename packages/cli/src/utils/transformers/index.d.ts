import { Config } from "@/src/utils/get-config";
import { registryBaseColorSchema } from "@/src/utils/registry/schema";
import { type SourceFile } from "ts-morph";
import { z } from "zod";
export type TransformOpts = {
    filename: string;
    raw: string;
    config: Config;
    baseColor?: z.infer<typeof registryBaseColorSchema>;
    transformJsx?: boolean;
};
export type Transformer<Output = SourceFile> = (opts: TransformOpts & {
    sourceFile: SourceFile;
}) => Promise<Output>;
export declare function transform(opts: TransformOpts, transformers?: Transformer[]): Promise<string>;
//# sourceMappingURL=index.d.ts.map