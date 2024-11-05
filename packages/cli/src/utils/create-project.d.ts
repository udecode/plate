import type { initOptionsSchema } from '@/src/commands/init';
import type { z } from 'zod';
export declare function createProject(options: Pick<z.infer<typeof initOptionsSchema>, 'cwd' | 'force' | 'pm' | 'srcDir'>): Promise<{
    projectName: null;
    projectPath: null;
} | {
    projectName: any;
    projectPath: string;
}>;
//# sourceMappingURL=create-project.d.ts.map