/** Immutable JSON data admitted by editor persistence and schema properties. */
export type EditorJsonValue =
  | boolean
  | null
  | number
  | string
  | readonly EditorJsonValue[]
  | Readonly<{ [key: string]: EditorJsonValue }>;
