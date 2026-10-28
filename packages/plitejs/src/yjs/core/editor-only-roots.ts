import type { RecordOps } from '../../core/record-store';
import { countCoreWork } from '../../core/work';

export class EditorOnlyRoots {
  private readonly idsByRoot = new Map<string, Map<string, Set<string>>>();
  private readonly rootsById = new Map<string, Map<string, string>>();

  has(root: string): boolean {
    return this.idsByRoot.has(root);
  }

  replace(
    root: string,
    records: RecordOps | null
  ): ReadonlyMap<string, ReadonlySet<string>> | undefined {
    const previous = this.take(root);
    const ids = new Map<string, Set<string>>();

    for (const [set, writes] of records ?? []) {
      if (writes.size === 0) continue;

      const roots = this.rootsById.get(set) ?? new Map<string, string>();

      this.rootsById.set(set, roots);
      ids.set(set, new Set(writes.keys()));
      for (const id of writes.keys()) roots.set(id, root);
    }
    if (ids.size > 0) this.idsByRoot.set(root, ids);

    return previous;
  }

  take(root: string): ReadonlyMap<string, ReadonlySet<string>> | undefined {
    const ids = this.idsByRoot.get(root);

    if (!ids) return undefined;
    this.idsByRoot.delete(root);
    for (const [set, setIds] of ids) {
      const roots = this.rootsById.get(set);

      for (const id of setIds) roots?.delete(id);
    }

    return ids;
  }

  drop(set: string, id: string): void {
    const root = this.rootsById.get(set)?.get(id);

    if (root === undefined) return;
    this.rootsById.get(set)?.delete(id);
    this.idsByRoot.get(root)?.get(set)?.delete(id);
  }

  rootsWriting(records: RecordOps): Set<string> {
    const roots = new Set<string>();

    for (const [set, writes] of records) {
      const held = this.rootsById.get(set);

      if (!held) continue;
      for (const id of writes.keys()) {
        countCoreWork('spareIdChecks');

        const root = held.get(id);

        if (root !== undefined) roots.add(root);
      }
    }

    return roots;
  }
}
