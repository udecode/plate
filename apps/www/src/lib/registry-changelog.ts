import fs from 'node:fs';
import path from 'node:path';

export type RegistryChangelogDiagnostic = {
  code: string;
  message?: string;
  severity: 'warning';
};

export type RegistryChangelogRelease = {
  status: 'latest' | 'released' | 'unresolved';
  changelogUrl?: string;
  packageTag?: string;
  requiresPlate?: string | null;
  source?: string;
  tag?: string;
  url?: string | null;
  versionPackagePullRequest?: {
    number: number;
    url: string | null;
  };
};

export type RegistryChangelogTarget = {
  name: string;
  definitionFiles: string[];
  diagnostics: RegistryChangelogDiagnostic[];
  files: string[];
};

export type RegistryChangelogEntry = {
  id: string;
  kind: string;
  summary: string;
  details: string[];
  migrationNotes: string[];
  source: {
    legacyRelease: {
      date: string;
      entry: string;
      section: string | null;
    };
    line: number;
    row: number;
  };
  targets: string[];
};

export type RegistryChangelogEvent = {
  schemaVersion: 1;
  id: string;
  status: 'draft';
  source: {
    kind: 'entry-mdx' | 'legacy-mdx';
    path: string;
  };
  change: {
    commits: {
      committedAt: string;
      date: string;
      sha: string;
      shortSha: string;
      subject: string;
      url: string;
    }[];
    date: string;
    pullRequest?: {
      mergedAt?: string;
      number: number;
      state: 'MERGED' | 'OPEN' | string;
      title: string;
      url: string;
    };
    type: 'pull_request' | 'commit' | 'source';
  };
  diagnostics: RegistryChangelogDiagnostic[];
  entries: RegistryChangelogEntry[];
  kind: string;
  release: RegistryChangelogRelease;
  summary: string;
  targets: RegistryChangelogTarget[];
};

export type RegistryChangelogIndex = {
  schemaVersion: 1;
  events: {
    id: string;
    href: string;
    status: RegistryChangelogEvent['status'];
    kind: string;
    summary: string;
    change: RegistryChangelogEvent['change'];
    diagnostics: Pick<RegistryChangelogDiagnostic, 'code' | 'severity'>[];
    entries: number;
    release: RegistryChangelogRelease;
    targets: string[];
  }[];
};

export type RegistryChangelogComponents = {
  schemaVersion: 1;
  components: Record<string, string[]>;
};

const registryChangelogDirCandidates = [
  path.join(process.cwd(), 'src/registry/changelog'),
  path.join(process.cwd(), 'apps/www/src/registry/changelog'),
];

function getRegistryChangelogDir() {
  const directory = registryChangelogDirCandidates.find((candidate) =>
    fs.existsSync(candidate)
  );

  if (!directory) {
    throw new Error('Could not find registry changelog directory.');
  }

  return directory;
}

function readRegistryChangelogJson<T>(fileName: string): T {
  return JSON.parse(
    fs.readFileSync(path.join(getRegistryChangelogDir(), fileName), 'utf8')
  ) as T;
}

export function getRegistryChangelogIndex() {
  return readRegistryChangelogJson<RegistryChangelogIndex>('index.json');
}

export function getRegistryChangelogComponents() {
  return readRegistryChangelogJson<RegistryChangelogComponents>(
    'components.json'
  );
}

export function getRegistryChangelogEvent(id: string) {
  const eventId = id.endsWith('.json') ? id.slice(0, -'.json'.length) : id;

  if (
    !getRegistryChangelogIndex().events.some((event) => event.id === eventId)
  ) {
    return null;
  }

  return readRegistryChangelogJson<RegistryChangelogEvent>(`${eventId}.json`);
}
