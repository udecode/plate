import ts from '@typescript/typescript6';

export const read = (name: string) => ts.sys.readFile(name);
