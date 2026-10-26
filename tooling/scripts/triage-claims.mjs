// The claims log on refs/triage/claims: who holds which issue of the triage
// repository, one row per move in push order. The ref only moves by
// fast-forward, so every clone folds the same order, and the first live claim
// wins. This module decides on a fetched log and the live signals; triage.mjs
// does the reading, the push and the GitHub writes.

export const CLAIMS_REF = 'refs/triage/claims';
export const CLAIMS_FILE = 'claims.tsv';
export const CLAIM_COLUMNS = [
  'ts',
  'issue',
  'move',
  'who',
  'session',
  'transcript',
  'task',
  'drives',
  'over',
  'why',
];
export const DEVICES = ['ios', 'android', 'ime'];
export const STALE_MS = 48 * 3_600_000;
export const COMMENT_WINDOW_MS = 30 * 86_400_000;
// Narrow on purpose: a false claim stops an unattended run until the owner takes the issue in their own words.
export const CLAIM_PHRASE =
  /\b(?:i['’]ll|i\s+will|(?:i['’]m|i\s+am)\s+going\s+to|(?:i['’]d|i\s+would)\s+like\s+to)\s+(?:take|work\s+on|fix|pick\s+up)\s+(?:a\s+fix\s+for\s+)?(?:this|it)\b|\b(?:i['’]ll|i\s+will)\s+pick\s+(?:this|it)\s+up\b|\b(?:i['’]m|i\s+am)\s+(?:already\s+)?(?:working\s+on|picking\s+up|taking)\s+(?:this|it)\b|\b(?:i['’]m|i\s+am)\s+picking\s+(?:this|it)\s+up\b|\bassign\s+(?:this|it)\s+to\s+me\b/iu;

const cell = (value) => (value === '-' || value === '' ? null : value);
const since = (ts) => Date.parse(ts ?? '');

export function parseClaims(text) {
  return text
    .split('\n')
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const cells = line.split('\t');
      const row = Object.fromEntries(
        CLAIM_COLUMNS.map((column, at) => [column, cells[at] ?? ''])
      );
      return {
        ...row,
        transcript: cell(row.transcript),
        task: cell(row.task),
        drives: cell(row.drives),
        over: cell(row.over)?.split(',') ?? [],
      };
    });
}

export const claimLine = (row) =>
  CLAIM_COLUMNS.map((column) => {
    const value = column === 'over' ? row.over.join(',') : row[column];
    return value === null || value === '' ? '-' : String(value);
  }).join('\t');

export const sameActor = (a, b) =>
  a.who === b.who &&
  (a.session === b.session ||
    (a.transcript !== null && a.transcript === b.transcript));

// endedAt(issue, claim) gives the time a claim ended without a row, such as its task landing, or null.
export function foldClaims(rows, { owners, endedAt }) {
  const live = new Map();
  for (const row of rows) {
    const current = live.get(row.issue);
    const ended = current ? endedAt(row.issue, current) : null;
    const held = current && !(ended !== null && since(ended) <= since(row.ts));
    const claim = {
      actor: { who: row.who, session: row.session, transcript: row.transcript },
      since: row.ts,
      task: row.task,
      over: row.over,
    };
    if (row.move === 'take' || (row.move === 'claim' && !held)) {
      live.set(row.issue, claim);
    } else if (
      row.move === 'claim' &&
      row.task !== null &&
      sameActor(current.actor, row)
    ) {
      // The holder claims again only to name the task its claim offered.
      live.set(row.issue, { ...current, task: row.task });
    } else if (
      row.move === 'release' &&
      held &&
      (sameActor(current.actor, row) || owners.includes(row.who))
    ) {
      live.delete(row.issue);
    }
  }
  for (const [issue, claim] of live) {
    if (endedAt(issue, claim) !== null) live.delete(issue);
  }
  return live;
}

function holdsOf(issue, world) {
  const { actor, now } = world;
  const claim = world.claims.get(issue);
  const mine = Boolean(claim && sameActor(claim.actor, actor));
  const signals = world.live.get(issue);
  const found = [];
  if (claim && !mine) {
    found.push({
      key: `claim:${claim.actor.who}/${claim.actor.session}`,
      who: claim.actor.who,
      since: claim.since,
      activity: world.activity(claim, issue),
    });
  }
  for (const { login, at } of signals.assignees) {
    if (login !== actor.who) {
      found.push({ key: `assignee:${login}`, who: login, since: at });
    }
  }
  for (const pr of signals.prs) {
    if (!(mine && pr.author === actor.who)) {
      found.push({
        key: `pr:${pr.number}`,
        who: pr.author,
        since: pr.createdAt,
        activity: pr.updatedAt,
      });
    }
  }
  for (const comment of signals.comments) {
    if (
      !comment.bot &&
      comment.author !== actor.who &&
      now - since(comment.createdAt) <= COMMENT_WINDOW_MS &&
      CLAIM_PHRASE.test(comment.body)
    ) {
      found.push({
        key: `comment:${comment.id}`,
        who: comment.author,
        since: comment.createdAt,
      });
    }
  }
  // A started row holds only for a task no claim row names, so a claim's own task never holds against a later claim.
  for (const linked of world.linked(issue)) {
    const task = world.tasks.get(linked.id);
    const ours =
      task.startedIn !== null &&
      [actor.session, actor.transcript].includes(task.startedIn);
    if (
      task.status === 'started' &&
      !ours &&
      !world.claimRows.some((row) => row.task === task.id)
    ) {
      const times = world.times(task.id);
      found.push({
        key: `task:${task.id}`,
        who: null,
        session: task.startedIn,
        since: times.started,
        activity: times.last,
      });
    }
  }
  const standing = mine
    ? found.filter((hold) => !claim.over.includes(hold.key))
    : found;
  const quiet = (hold) => {
    const last = Math.max(
      ...[hold.since, hold.activity].map(since).filter(Number.isFinite)
    );
    return Number.isFinite(last) && now - last > STALE_MS;
  };
  return {
    mine,
    holds: standing.map((hold) => ({ ...hold, stale: quiet(hold) })),
  };
}

export const devicesOf = (head) =>
  head?.outcome === 'kind' && head.fields.has('device')
    ? head.fields.get('device').split(/,\s*/u)
    : [];

function rootOf(issue, world) {
  let root = issue;
  const seen = new Set([root]);
  while (world.head(root)?.outcome === 'dup') {
    const next = world.head(root).fields.get('of');
    if (seen.has(next)) break;
    seen.add(next);
    root = next;
  }
  return root;
}

export const laneOf = (issue, world) =>
  devicesOf(world.head(rootOf(issue, world)));

const dupsOf = (issue, world) =>
  [...world.open.keys()].filter((other) => {
    const head = world.head(other);
    return head?.outcome === 'dup' && head.fields.get('of') === issue;
  });

export const ownerFiles = (head) =>
  head?.outcome === 'kind'
    ? head.fields
        .get('owner')
        .split(/,\s*/u)
        .map((ref) => ref.replace(/:\d+(?:-\d+)?$/u, ''))
    : [];

const openTasks = (issue, world) =>
  world
    .linked(issue)
    .filter((task) => task.status === 'offered' || task.status === 'started');

function tiedTo(issues, world, { tasks = true } = {}) {
  const tied = [...new Set(issues)];
  for (const member of tied) {
    const head = world.head(member);
    const next = [
      ...(head?.outcome === 'dup' ? [head.fields.get('of')] : []),
      ...dupsOf(member, world),
      ...(tasks
        ? openTasks(member, world).flatMap((task) => world.taskIssues(task.id))
        : []),
    ];
    for (const issue of next) if (!tied.includes(issue)) tied.push(issue);
  }
  return tied;
}

function issueGroup(issue, world) {
  const root = rootOf(issue, world);
  const head = world.head(issue);
  const roots =
    root === issue && head?.outcome === 'split'
      ? head.fields.get('into').split(/,\s*/u)
      : [root];
  const files = new Set(roots.flatMap((each) => ownerFiles(world.head(each))));
  const sharers = [...world.open.keys()].filter(
    (other) =>
      !roots.includes(other) &&
      ownerFiles(world.head(other)).some((file) => files.has(file))
  );
  return { roots, members: tiedTo([issue, ...roots, ...sharers], world) };
}

export function targetMembers(target, world) {
  if (target.issues) {
    const groups = target.issues.map((issue) => issueGroup(issue, world));
    const members = [...new Set(groups.flatMap((group) => group.members))];
    return {
      members,
      units: [members],
      roots: groups.flatMap((group) => group.roots),
      allowed: null,
    };
  }
  let base;
  if (target.domain) {
    const kinds = [...world.open.keys()].filter((issue) => {
      const head = world.head(issue);
      return (
        head?.outcome === 'kind' && head.fields.get('scope') === target.domain
      );
    });
    base = target.task
      ? [
          ...world.taskIssues(target.task),
          ...kinds.filter((issue) => openTasks(issue, world).length === 0),
        ]
      : kinds;
  } else base = world.taskIssues(target.task);
  base = [...new Set(base)];
  const units = [];
  for (const issue of base) {
    if (!units.some((unit) => unit.includes(issue))) {
      units.push(tiedTo([issue], world));
    }
  }
  return {
    members: [...new Set(units.flat())],
    units,
    roots: [],
    allowed: new Set(tiedTo(base, world, { tasks: false })),
  };
}

const skipOf = (issue, request, world) => {
  if (!world.open.has(issue)) return { verdict: 'closed' };
  if (world.head(issue)?.outcome === 'fixed') return { verdict: 'fixed' };
  const devices = laneOf(issue, world);
  if (devices.length === 0) {
    return request.drives ? { verdict: 'desktop' } : null;
  }
  return devices.includes(request.drives)
    ? null
    : { verdict: 'device', devices };
};

const verdictOf = (issue, request, world) => {
  const skip = skipOf(issue, request, world);
  if (skip) return skip;
  const { mine, holds } = holdsOf(issue, world);
  const taken = holds.filter((hold) => request.take.includes(hold.key));
  const left = holds.filter((hold) => !request.take.includes(hold.key));
  if (left.length > 0) return { verdict: 'held', holds: left };
  if (taken.length > 0) return { verdict: 'take', taken };
  return { verdict: mine ? 'mine' : 'claim' };
};

const HOLDS = new Set(['claim', 'take', 'mine']);

const STOPS_ROOT = new Set(['device', 'desktop', 'closed', 'fixed']);

export function decide(request, world) {
  const { members, units, roots, allowed } = targetMembers(
    request.target,
    world
  );
  const results = new Map(
    members.map((issue) => [
      issue,
      { issue, ...verdictOf(issue, request, world) },
    ])
  );
  const foreign = [...results.values()]
    .flatMap((result) => result.taken ?? [])
    .filter((hold) => hold.who !== world.actor.who);
  if (foreign.length > 0 && !world.owners.includes(world.actor.who)) {
    return {
      members,
      results: [...results.values()],
      refusal: `only ${world.owners.join(' or ')} takes over another login's hold (${foreign.map((hold) => hold.key).join(', ')}); ask them`,
    };
  }
  const stopper = roots.find((root) =>
    STOPS_ROOT.has(results.get(root).verdict)
  );
  for (const unit of units) {
    const outside = allowed
      ? unit.filter(
          (issue) =>
            !allowed.has(issue) && HOLDS.has(results.get(issue).verdict)
        )
      : [];
    for (const issue of outside) results.get(issue).verdict = 'outside';
    const blocker =
      unit.find((issue) => results.get(issue).verdict === 'held') ??
      outside[0] ??
      stopper;
    for (const issue of unit) {
      const result = results.get(issue);
      if (blocker !== undefined && HOLDS.has(result.verdict)) {
        result.verdict = 'follows';
        result.blocker = {
          issue: blocker,
          verdict: results.get(blocker).verdict,
        };
      }
    }
  }
  const held = members.filter((issue) => HOLDS.has(results.get(issue).verdict));
  const agentWork = (task) =>
    world
      .taskIssues(task.id)
      .filter((issue) => skipOf(issue, { drives: null }, world) === null);
  const candidates = new Set([
    ...held.flatMap((issue) => openTasks(issue, world).map((task) => task.id)),
    ...(request.target.task ? [request.target.task] : []),
  ]);
  const starts = [...candidates].filter((id) => {
    const task = world.tasks.get(id);
    const issues = task?.status === 'offered' ? agentWork(task) : [];
    return (
      issues.length > 0 &&
      issues.every((issue) => held.includes(issue)) &&
      world.ready(task)
    );
  });
  const loose =
    request.drives || request.target.task
      ? []
      : held.filter((issue) =>
          tiedTo([issue], world, { tasks: false }).every(
            (each) => openTasks(each, world).length === 0
          )
        );
  const offer = offerOf(loose, world);
  const offered = (issue) =>
    offer?.skip === null && offer.issues.includes(issue);
  const taskOf = (issue) =>
    starts.find((id) => world.taskIssues(id).includes(issue)) ??
    (request.target.task &&
    world.taskIssues(request.target.task).includes(issue)
      ? request.target.task
      : null) ??
    (offered(issue) ? request.offerId : null);
  const writes = members.flatMap((issue) => {
    const result = results.get(issue);
    const naming = result.verdict === 'mine' && offered(issue);
    if (result.verdict !== 'claim' && result.verdict !== 'take' && !naming) {
      return [];
    }
    return [
      {
        issue,
        move: result.verdict === 'take' ? 'take' : 'claim',
        task: taskOf(issue),
        drives: laneOf(issue, world).length > 0 ? request.drives : null,
        over: (result.taken ?? []).map((hold) => hold.key),
      },
    ];
  });
  return {
    members,
    results: [...results.values()],
    writes,
    held,
    starts,
    offer,
    refusal: null,
    exit: held.length > 0 ? 0 : 1,
  };
}

export const domainsOf = (world) =>
  [
    ...new Set(
      [...world.open.keys()]
        .map((issue) => world.head(issue))
        .filter((head) => head?.outcome === 'kind')
        .map((head) => head.fields.get('scope'))
    ),
  ].sort((a, b) => a.localeCompare(b));

export function decideNext(request, world) {
  const [best] = domainsOf(world)
    .map((domain) => {
      const target = { domain, task: null };
      const result = decide({ ...request, target }, world);
      const priorities = result.held
        .map((issue) => world.head(issue))
        .filter((head) => head?.outcome === 'kind')
        .map((head) => head.fields.get('priority'))
        .sort((a, b) => a.localeCompare(b));
      return { ...result, target, priorities };
    })
    .filter((result) => result.exit === 0)
    .sort(
      (a, b) =>
        a.priorities[0].localeCompare(b.priorities[0]) ||
        b.priorities.length - a.priorities.length
    );
  return (
    best ?? {
      members: [],
      results: [],
      writes: [],
      held: [],
      starts: [],
      offer: null,
      refusal: null,
      exit: 1,
      target: null,
    }
  );
}

// chips.md lets only a verdict, babysit or time run offer a P2 or P3 task.
const OFFERED = new Set(['P0', 'P1']);

function offerOf(loose, world) {
  const unrecorded = loose.filter((issue) => !world.head(issue));
  if (unrecorded.length > 0) return { skip: 'unrecorded', issues: unrecorded };
  const kinds = [...new Set(loose.map((issue) => rootOf(issue, world)))].filter(
    (issue) => world.head(issue)?.outcome === 'kind'
  );
  if (kinds.length === 0) return null;
  const issues = loose
    .filter((issue) => kinds.includes(rootOf(issue, world)))
    .sort((a, b) => Number(a) - Number(b));
  const priority = kinds
    .map((issue) => world.head(issue).fields.get('priority'))
    .sort((a, b) => a.localeCompare(b))[0];
  if (!OFFERED.has(priority)) return { skip: 'priority', issues, priority };
  return {
    skip: null,
    issues,
    kinds,
    priority,
    files: [
      ...new Set(kinds.flatMap((issue) => ownerFiles(world.head(issue)))),
    ],
  };
}
