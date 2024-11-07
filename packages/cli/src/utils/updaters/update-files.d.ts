import { Config } from "@/src/utils/get-config";
import { getProjectInfo } from "@/src/utils/get-project-info";
import { RegistryItem } from "@/src/utils/registry/schema";
export declare function resolveTargetDir(projectInfo: Awaited<ReturnType<typeof getProjectInfo>>, config: Config, target: string): string;
export declare function updateFiles(files: RegistryItem["files"], config: Config, options: {
    overwrite?: boolean;
    force?: boolean;
    silent?: boolean;
}): Promise<void>;
//# sourceMappingURL=update-files.d.ts.map