import type { StaticDocument } from '../document';

type Check = (next: StaticDocument) => boolean;
const observations = new WeakMap<StaticDocument, Check[]>();

/** Record the immutable nodes read by one rendered subtree, including its children. */
export function observeStaticDocument(source: StaticDocument): StaticDocument {
  const checks: Check[] = [];
  const observe = (
    document: StaticDocument,
    project: (next: StaticDocument) => StaticDocument
  ): StaticDocument => {
    const nodes: StaticDocument['nodes'] = {
      get(path, options) {
        const entry = document.nodes.get(path, options);
        checks.push(
          (next) => project(next).nodes.get(path, options)?.[0] === entry?.[0]
        );
        return entry;
      },
      parent: (path) =>
        path.length ? nodes.get(path.slice(0, -1)) : undefined,
      path(node) {
        const path = document.nodes.path(node);
        checks.push(
          (next) =>
            project(next).nodes.path(node)?.join(',') === path?.join(',')
        );
        return path;
      },
      entries() {
        const children = document.children();
        checks.push((next) => project(next).children() === children);
        return document.nodes.entries();
      },
    };
    return {
      root: document.root,
      schema: document.schema,
      nodes,
      children() {
        const children = document.children();
        checks.push((next) => project(next).children() === children);
        return children;
      },
      forRoot: (root) =>
        observe(document.forRoot(root), (next) => project(next).forRoot(root)),
      anchorId(path) {
        const id = document.anchorId(path);
        checks.push((next) => project(next).anchorId(path) === id);
        return id;
      },
    };
  };
  const document = observe(source, (next) => next);
  observations.set(document, checks);
  return document;
}

/** Replaying reads also transfers child dependencies into the next parent scope. */
export function staticReadsEqual(
  previous?: StaticDocument,
  next?: StaticDocument
) {
  if (previous === next) return true;
  if (
    !previous ||
    !next ||
    previous.schema !== next.schema ||
    previous.root !== next.root
  ) {
    return false;
  }
  const checks = observations.get(previous);
  return !!checks && checks.every((check) => check(next));
}
