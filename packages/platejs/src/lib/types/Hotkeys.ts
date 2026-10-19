export type HotkeysEvent = {
  keys?: readonly string[];
  description?: string;
  alt?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  mod?: boolean;
  shift?: boolean;
  useKey?: boolean;
};
