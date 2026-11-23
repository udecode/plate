import {
  getActiveEditorUpdateId,
  getEditorRuntimeOwner,
  getSnapshotVersion,
  readShownDocument,
  type RuntimeAnyEditor,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import type { FieldElement } from './BaseFieldPlugin';

export type FieldLink = Readonly<{
  loop: boolean;
  target: FieldElement | undefined;
}>;

type Held = (fieldId: string) => FieldElement | undefined;

export const fieldLinks = () => {
  const links = new Map<string, FieldLink>();

  return (field: FieldElement, held: Held): FieldLink => {
    const path: FieldElement[] = [];
    const places = new Map<string, number>();
    let next: FieldElement | undefined = field;

    while (next && !links.has(next.fieldId) && !places.has(next.fieldId)) {
      places.set(next.fieldId, path.length);
      path.push(next);
      next = next.condition && held(next.condition.ref);
    }

    const loopStart = next ? places.get(next.fieldId) : undefined;

    for (let index = path.length - 1; index >= 0; index--) {
      links.set(path[index].fieldId, {
        loop: loopStart !== undefined && index >= loopStart,
        target: path[index + 1] ?? next,
      });
    }

    return (
      links.get(field.fieldId) ??
      failInvariant('A field was read before its link.')
    );
  };
};

const shared = new WeakMap<
  object,
  Readonly<{ links: ReturnType<typeof fieldLinks>; version?: number }>
>();

const linksOf = (key: object, version?: number) => {
  const kept = shared.get(key);

  if (kept && kept.version === version) return kept.links;

  const links = fieldLinks();

  shared.set(key, { links, version });

  return links;
};

export const sharedFieldLinks = (editor: RuntimeAnyEditor) => {
  if (getActiveEditorUpdateId(editor)) return fieldLinks();

  const shown = readShownDocument(editor);

  if (shown) return linksOf(shown);

  const owner = getEditorRuntimeOwner(editor);

  return linksOf(owner, getSnapshotVersion(owner));
};
