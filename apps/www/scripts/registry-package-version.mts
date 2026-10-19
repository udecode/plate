type Version = readonly [number, number, number];

type Bound = {
  inclusive: boolean;
  version: Version;
};

type Interval = {
  lower?: Bound;
  upper?: Bound;
};

const VERSION_REGEX = /^(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?$/;

function compareVersions(left: Version, right: Version) {
  for (let index = 0; index < 3; index++) {
    const difference = left[index] - right[index];

    if (difference !== 0) return Math.sign(difference);
  }

  return 0;
}

function parseVersion(value: string) {
  const match = VERSION_REGEX.exec(value.trim().replace(/^v/, ''));

  if (!match) return null;

  const specifiedParts = [match[1], match[2], match[3]].filter(
    (part) => part !== undefined
  );
  const wildcardIndex = specifiedParts.findIndex(
    (part) => part === 'x' || part === '*'
  );
  const precision =
    wildcardIndex === -1 ? specifiedParts.length : wildcardIndex;

  return {
    precision,
    version: [
      Number(match[1]),
      match[2] && match[2] !== 'x' && match[2] !== '*' ? Number(match[2]) : 0,
      match[3] && match[3] !== 'x' && match[3] !== '*' ? Number(match[3]) : 0,
    ] as Version,
  };
}

function nextVersion(version: Version, precision: number): Version {
  if (precision <= 1) return [version[0] + 1, 0, 0];
  if (precision === 2) return [version[0], version[1] + 1, 0];

  return [version[0], version[1], version[2] + 1];
}

function stricterLower(left: Bound | undefined, right: Bound) {
  if (!left) return right;
  const comparison = compareVersions(left.version, right.version);

  if (comparison < 0) return right;
  if (comparison > 0) return left;

  return { ...left, inclusive: left.inclusive && right.inclusive };
}

function stricterUpper(left: Bound | undefined, right: Bound) {
  if (!left) return right;
  const comparison = compareVersions(left.version, right.version);

  if (comparison > 0) return right;
  if (comparison < 0) return left;

  return { ...left, inclusive: left.inclusive && right.inclusive };
}

function addComparator(interval: Interval, token: string) {
  const match = /^(\^|~|>=|<=|>|<|=)?(.+)$/.exec(token);
  const operator = match?.[1] ?? '';
  const parsed = match ? parseVersion(match[2]) : null;

  if (!parsed) {
    throw new Error(`Unsupported package version range token: ${token}`);
  }

  const { precision, version } = parsed;

  if (operator === '^') {
    const upper: Version =
      version[0] > 0
        ? [version[0] + 1, 0, 0]
        : version[1] > 0
          ? [0, version[1] + 1, 0]
          : [0, 0, version[2] + 1];
    interval.lower = stricterLower(interval.lower, {
      inclusive: true,
      version,
    });
    interval.upper = stricterUpper(interval.upper, {
      inclusive: false,
      version: upper,
    });

    return;
  }
  if (operator === '~') {
    interval.lower = stricterLower(interval.lower, {
      inclusive: true,
      version,
    });
    interval.upper = stricterUpper(interval.upper, {
      inclusive: false,
      version: nextVersion(version, Math.min(precision, 2)),
    });

    return;
  }
  if (operator === '>' || operator === '>=') {
    interval.lower = stricterLower(interval.lower, {
      inclusive: operator === '>=',
      version,
    });

    return;
  }
  if (operator === '<' || operator === '<=') {
    interval.upper = stricterUpper(interval.upper, {
      inclusive: operator === '<=',
      version,
    });

    return;
  }
  if (precision < 3) {
    interval.lower = stricterLower(interval.lower, {
      inclusive: true,
      version,
    });
    interval.upper = stricterUpper(interval.upper, {
      inclusive: false,
      version: nextVersion(version, precision),
    });

    return;
  }

  interval.lower = stricterLower(interval.lower, {
    inclusive: true,
    version,
  });
  interval.upper = stricterUpper(interval.upper, {
    inclusive: true,
    version,
  });
}

function parseRangeClause(clause: string) {
  const normalized = clause.trim().replace(/^workspace:/, '');

  if (
    !normalized ||
    normalized === '*' ||
    normalized.toLowerCase() === 'latest'
  ) {
    return { interval: {}, normalized: '*' };
  }

  const hyphenRange = /^(\S+)\s+-\s+(\S+)$/.exec(normalized);
  const tokens = hyphenRange
    ? [`>=${hyphenRange[1]}`, `<=${hyphenRange[2]}`]
    : normalized.split(/\s+/);
  const interval: Interval = {};

  for (const token of tokens) addComparator(interval, token);

  return { interval, normalized: tokens.join(' ') };
}

function rangesOverlap(left: Interval, right: Interval) {
  const lower = right.lower
    ? stricterLower(left.lower, right.lower)
    : left.lower;
  const upper = right.upper
    ? stricterUpper(left.upper, right.upper)
    : left.upper;

  if (!lower || !upper) return true;

  const comparison = compareVersions(lower.version, upper.version);

  return (
    comparison < 0 || (comparison === 0 && lower.inclusive && upper.inclusive)
  );
}

export function intersectPackageVersionRanges(left: string, right: string) {
  const leftClauses = left.split('||').map(parseRangeClause);
  const rightClauses = right.split('||').map(parseRangeClause);
  const intersections: string[] = [];

  for (const leftClause of leftClauses) {
    for (const rightClause of rightClauses) {
      if (!rangesOverlap(leftClause.interval, rightClause.interval)) continue;

      const intersection =
        leftClause.normalized === '*'
          ? rightClause.normalized
          : rightClause.normalized === '*' ||
              leftClause.normalized === rightClause.normalized
            ? leftClause.normalized
            : `${leftClause.normalized} ${rightClause.normalized}`;

      if (!intersections.includes(intersection)) {
        intersections.push(intersection);
      }
    }
  }

  return intersections.length > 0 ? intersections.join(' || ') : null;
}

export function packageVersionRangesIntersect(left: string, right: string) {
  return intersectPackageVersionRanges(left, right) !== null;
}
