import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { auditInlineComponentProps } from './check-inline-component-props.mjs';

const createFixture = (sources, manifests = {}) => {
  const cwd = mkdtempSync(join(tmpdir(), 'plate-inline-props-'));

  for (const [file, source] of Object.entries({ ...sources, ...manifests })) {
    const path = join(cwd, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, source);
  }

  return {
    cwd,
    files: Object.keys(sources),
  };
};

test('rejects local and same-file-reused component prop aliases', () => {
  const fixture = createFixture({
    'apps/example/src/example.tsx': `
      type ButtonProps = { label: string };
      const readLabel = (props: ButtonProps) => props.label;
      export function Button(props: ButtonProps) {
        return <button>{readLabel(props)}</button>;
      }
    `,
  });

  const result = auditInlineComponentProps(fixture);

  assert.equal(result.issueCount, 1);
  assert.equal(result.candidates[0].name, 'ButtonProps');
  assert.equal(result.candidates[0].decision, 'inline');
});

test('accepts inline props and semantic state selected inside inline props', () => {
  const fixture = createFixture({
    'apps/example/src/example.tsx': `
      type DialogState = { open: boolean; title: string };
      export function Dialog(
        props: { children: React.ReactNode } & Pick<DialogState, 'open'>
      ) {
        return props.open ? <div>{props.children}</div> : null;
      }
    `,
  });

  assert.equal(auditInlineComponentProps(fixture).candidateCount, 0);
});

test('audits archived TSX and options contracts nested in prop wrappers', () => {
  const { cwd } = createFixture({
    'docs/transplant/archive/Picker.tsx': `
      type PickerOptions = { disabled?: boolean };
      export function Picker(props: React.PropsWithChildren<PickerOptions>) {
        return props.disabled ? null : <div>{props.children}</div>;
      }
    `,
  });

  const result = auditInlineComponentProps({ cwd });

  assert.equal(result.reviewedTsxFileCount, 1);
  assert.equal(result.issueCount, 1);
  assert.equal(result.candidates[0].name, 'PickerOptions');
});

test('keeps exported prop contracts consumed through another file', () => {
  const fixture = createFixture({
    'packages/example/src/Button.tsx': `
      export type ButtonProps = { label: string };
      export function Button(props: ButtonProps) {
        return <button>{props.label}</button>;
      }
    `,
    'packages/example/src/index.ts': `
      export { Button, type ButtonProps } from './Button';
    `,
    'packages/example/src/consumer.ts': `
      import type { ButtonProps } from './index';
      export const button: ButtonProps = { label: 'Save' };
    `,
  });

  const result = auditInlineComponentProps(fixture);

  assert.equal(result.issueCount, 0);
  assert.deepEqual(result.candidates[0].externalConsumers, [
    'packages/example/src/consumer.ts:ButtonProps',
  ]);
});

test('rejects an internal reexport with no consumer or public entrypoint', () => {
  const fixture = createFixture({
    'apps/example/src/Button.tsx': `
      export type ButtonProps = { label: string };
      export function Button(props: ButtonProps) {
        return <button>{props.label}</button>;
      }
    `,
    'apps/example/src/index.ts': `
      export { Button, type ButtonProps } from './Button';
    `,
  });

  const result = auditInlineComponentProps(fixture);

  assert.equal(result.issueCount, 1);
  assert.deepEqual(result.candidates[0].reexports, [
    'apps/example/src/index.ts:ButtonProps',
  ]);
});

test('does not count an unused type import as a contract consumer', () => {
  const fixture = createFixture({
    'apps/example/src/Button.tsx': `
      export type ButtonProps = { label: string };
      export function Button(props: ButtonProps) {
        return <button>{props.label}</button>;
      }
    `,
    'apps/example/src/consumer.ts': `
      import type { ButtonProps } from './Button';
      export const label = 'Save';
    `,
  });

  const result = auditInlineComponentProps(fixture);

  assert.equal(result.issueCount, 1);
  assert.deepEqual(result.candidates[0].externalConsumers, []);
});

test('rejects an exported prop alias with no external contract', () => {
  const fixture = createFixture({
    'apps/example/src/example.tsx': `
      export type ButtonProps = { label: string };
      export function Button(props: ButtonProps) {
        return <button>{props.label}</button>;
      }
    `,
  });

  assert.equal(auditInlineComponentProps(fixture).issueCount, 1);
});

test('keeps a prop type declared by a published package entrypoint', () => {
  const fixture = createFixture(
    {
      'packages/example/src/react.tsx': `
        export type ButtonProps = { label: string };
        export function Button(props: ButtonProps) {
          return <button>{props.label}</button>;
        }
      `,
    },
    {
      'packages/example/package.json': JSON.stringify({
        exports: {
          './react': {
            import: './dist/react.js',
            types: './dist/react.d.ts',
          },
        },
        name: 'example',
      }),
    }
  );

  const result = auditInlineComponentProps(fixture);

  assert.equal(result.issueCount, 0);
  assert.equal(result.candidates[0].publicEntrypoint, true);
});

test('traces package props through configured public source entrypoints', () => {
  const fixture = createFixture(
    {
      'packages/example/src/Button.tsx': `
        export type ButtonProps = { label: string };
        export function Button(props: ButtonProps) {
          return <button>{props.label}</button>;
        }
      `,
      'packages/example/src/internal/react/index.ts': `
        export { Button, type ButtonProps } from '../../Button';
      `,
    },
    {
      'packages/example/package.json': JSON.stringify({
        exports: {
          './react': {
            import: './dist/react/index.js',
            types: './dist/react/index.d.ts',
          },
        },
        name: 'example',
      }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          paths: {
            'example/react': ['./packages/example/src/internal/react/index.ts'],
          },
        },
      }),
    }
  );

  const result = auditInlineComponentProps(fixture);

  assert.equal(result.issueCount, 0);
  assert.equal(result.candidates[0].publicEntrypoint, true);
  assert.deepEqual(result.candidates[0].externalConsumers, []);
});

test('finds prop aliases on React wrappers and class components', () => {
  const fixture = createFixture({
    'apps/example/src/example.tsx': `
      type ForwardedProps = { label: string };
      type ClassProps = { label: string };
      export const Forwarded = React.forwardRef<HTMLButtonElement, ForwardedProps>(
        (props, ref) => <button ref={ref}>{props.label}</button>
      );
      export class ClassButton extends React.Component<ClassProps> {
        render() { return <button>{this.props.label}</button>; }
      }
    `,
  });

  const result = auditInlineComponentProps(fixture);

  assert.equal(result.issueCount, 2);
  assert.deepEqual(
    result.candidates
      .map(({ name }) => name)
      .sort((left, right) => left.localeCompare(right)),
    ['ClassProps', 'ForwardedProps']
  );
});
