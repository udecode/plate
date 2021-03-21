import { Text } from 'slate';

export type TText<TExtension = {}> = Text &
  TExtension & {
    [key: string]: any;
  };

export const isText: <TExtension = {}>(
  value: any
) => value is TText<TExtension> = Text.isText as any;
