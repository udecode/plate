import { readAuthoredTextBoundary } from './retained';
import { authoredOperationOrigin, type AuthoredStep } from './steps';

export const classifyAuthoredFormatting = (
  steps: readonly AuthoredStep[],
  operationId: string
) => {
  let direct = false;
  let onlyFormatting = true;
  for (const step of steps) {
    if (step.rootTargets.length) onlyFormatting = false;
    for (const target of step.targets) {
      const section = (
        target.root === 'main'
          ? step.forward.primary
          : step.forward.roots?.[target.root]
      )?.[target.section];
      if (!section) throw new Error('Missing authored formatting section.');
      const { retained } = target;
      if (
        section.properties &&
        retained?.kind === 'properties' &&
        retained.nodeKind === 'text' &&
        retained.spans
      ) {
        for (const span of retained.spans) {
          if (
            span.origin === authoredOperationOrigin(operationId, target.root)
          ) {
            onlyFormatting = false;
          } else direct = true;
        }
      } else if (!readAuthoredTextBoundary(target, section)) {
        onlyFormatting = false;
      }
    }
  }
  return direct ? { onlyFormatting } : null;
};
