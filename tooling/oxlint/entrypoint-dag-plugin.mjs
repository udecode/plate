import {
  assertEntrypointDags,
  classifyEntrypoint,
  entrypointDags,
  findPackageSource,
  resolveEntrypointEdge,
} from '../entrypoints/entrypoint-dag.mjs';

export {
  assertEntrypointDags,
  classifyEntrypoint,
  entrypointDags,
  findPackageSource,
  resolveEntrypointEdge,
};

const formatEntrypoint = (packageName, entrypointName) =>
  entrypointName === 'root' ? packageName : `${packageName}/${entrypointName}`;

const entrypointDagRule = {
  create(context) {
    const checkSource = (source) => {
      if (source?.type !== 'Literal' && source?.type !== 'StringLiteral') {
        return;
      }
      if (typeof source.value !== 'string') return;

      const edge = resolveEntrypointEdge(context.filename, source.value);

      if (!edge) return;

      if (edge.escapedSourceRoot) {
        context.report({
          data: {
            from: formatEntrypoint(edge.packageName, edge.from),
            packageName: edge.packageName,
          },
          messageId: 'sourceRootEscape',
          node: source,
        });
        return;
      }

      if (edge.peerImport) {
        const allowedPeers =
          edge.definition.entrypoints[edge.from].peerDependencies ?? [];

        if (allowedPeers.includes(edge.to)) return;

        context.report({
          data: {
            allowed:
              allowedPeers.length === 0 ? 'none' : allowedPeers.join(', '),
            from: formatEntrypoint(edge.packageName, edge.from),
            to: edge.to,
          },
          messageId: 'forbiddenPeerImport',
          node: source,
        });
        return;
      }

      if (edge.packageName === edge.toPackageName && edge.from === edge.to) {
        return;
      }

      const entrypoint = edge.definition.entrypoints[edge.from];
      const allowedDependencies = edge.publicImport
        ? entrypoint.externalDependencies
        : entrypoint.dependencies;
      const target = formatEntrypoint(edge.toPackageName, edge.to);

      if (
        allowedDependencies.includes(
          edge.publicImport && edge.toPackageName !== edge.packageName
            ? target
            : edge.to
        )
      ) {
        return;
      }

      context.report({
        data: {
          allowed:
            allowedDependencies.length === 0
              ? 'none'
              : allowedDependencies
                  .map((dependency) =>
                    edge.publicImport
                      ? dependency
                      : formatEntrypoint(edge.packageName, dependency)
                  )
                  .join(', '),
          from: formatEntrypoint(edge.packageName, edge.from),
          to: target,
        },
        messageId: 'forbiddenEntrypointImport',
        node: source,
      });
    };

    const checkDynamicImport = (node) => {
      if (
        node.source.type === 'Literal' ||
        node.source.type === 'StringLiteral'
      ) {
        checkSource(node.source);
        return;
      }

      const packageSource = findPackageSource(context.filename);

      if (!packageSource) return;

      context.report({
        data: {
          packageName: packageSource.packageName,
        },
        messageId: 'dynamicImportSource',
        node: node.source,
      });
    };

    return {
      ExportAllDeclaration: ({ source }) => checkSource(source),
      ExportNamedDeclaration: ({ source }) => checkSource(source),
      ImportDeclaration: ({ source }) => checkSource(source),
      ImportExpression: checkDynamicImport,
      TSExternalModuleReference: ({ expression }) => checkSource(expression),
      TSImportType: ({ source }) => checkSource(source),
    };
  },
  meta: {
    docs: {
      description: 'Enforce each declared package entrypoint dependency graph.',
    },
    messages: {
      dynamicImportSource:
        '{{packageName}} source must use a string literal in dynamic import() so the entrypoint DAG remains enforceable.',
      forbiddenEntrypointImport:
        '{{from}} cannot import {{to}}. Allowed cross-entrypoint dependencies: {{allowed}}.',
      forbiddenPeerImport:
        '{{from}} cannot import optional peer {{to}}. Allowed direct optional peers: {{allowed}}.',
      sourceRootEscape:
        '{{from}} cannot import outside {{packageName}}/src. Import a declared package entrypoint instead.',
    },
    type: 'problem',
  },
};

export default {
  meta: {
    name: 'plate-entrypoint-dag',
  },
  rules: {
    'no-forbidden-imports': entrypointDagRule,
  },
};

export { entrypointDagRule };
