// Installed by the sync-pstack skill. Pure: what a plan page's database holds,
// how two copies of a plan order, and the deck that draws the database on the
// page.

export const COLLECTION = 'runs';
export const CAPABILITIES = { db: { rules: [{ path: COLLECTION, read: 'view', write: 'admin' }] } };
export const MAX_WRITES = 50;

export const slugOf = (path) => path.split('/').at(-1).replace(/\.md$/u, '').replace(/[^A-Za-z0-9._-]+/gu, '-');

export function handbackOf(parts, { blob, history = [], landed = false }, { session, at, since = at, stage = null, state = null, stop = null }) {
  const { plan, slug, title, status, brief, asks, picks } = parts;
  return { kind: 'handback', v: 1, plan, slug, title, session, at, since, stage, state, blob, history, landed: Boolean(landed), status, brief, asks, picks, ...(stop ? { stop } : {}) };
}

export const asking = (copy) => {
  const unsettledPicks = copy.picks.length > 0 && copy.state !== 'done';
  return copy.asks.length > 0 || copy.state === 'waiting' || copy.state === 'blocked' || unsettledPicks;
};

export function supersedes(a, b) {
  if (a.plan !== b.plan) return false;
  const holds = (x, y) => x.blob === y.blob || (x.history ?? []).includes(y.blob);
  const ab = holds(a, b);
  if (ab !== holds(b, a)) return ab;
  const later = (a.at ?? '') > (b.at ?? '');
  if (ab) return later;
  const sameRunOrLanded = (Boolean(a.session) && a.session === b.session) || Boolean(a.landed);
  return later && sameRunOrLanded;
}

export function deckModel(docs, data, now) {
  const DAY = 86_400_000;
  const age = (note) => now - Date.parse(note.at);
  const notes = docs.filter((note) => note && typeof note.plan === 'string' && typeof note.at === 'string' && typeof note.session === 'string');
  const newest = new Map();
  for (const note of notes.filter((each) => each.kind === 'beacon' || each.stop)) {
    const key = `${note.plan}\n${note.session}`;
    if (!newest.has(key) || newest.get(key).at < note.at) newest.set(key, note);
  }
  const lines = [...newest.values()]
    .filter((note) => age(note) <= 7 * DAY)
    .sort((a, b) => b.at.localeCompare(a.at))
    .map(({ plan, slug, title, session, stage, state, at, since }) => ({ plan, slug, title, session, stage, state, at, since: since ?? at, quiet: age({ at }) > DAY }));
  const body = new Map((data?.plans ?? []).map((copy) => [copy.plan, copy]));
  const unique = new Map();
  for (const copy of notes.filter((note) => note.kind === 'handback' && Array.isArray(note.asks) && Array.isArray(note.picks))) {
    const key = `${copy.plan}\n${copy.blob}`;
    if (!unique.has(key) || unique.get(key).at < copy.at) unique.set(key, copy);
  }
  const copies = [...unique.values()];
  const shown = (copy) => {
    const held = body.get(copy.plan);
    if (held && (held.blob === copy.blob ? held.shows === 'all' : supersedes(held, copy))) return false;
    if (copies.some((other) => other !== copy && supersedes(other, copy))) return false;
    return asking(copy) || age(copy) <= (copy.state === 'done' ? 3 : 7) * DAY;
  };
  const cards = copies
    .filter(shown)
    .map((copy) => ({ ...copy, asks: body.get(copy.plan)?.blob === copy.blob ? [] : copy.asks, asking: asking(copy) }))
    .sort((a, b) => Number(b.asking) - Number(a.asking) || b.at.localeCompare(a.at));
  const changed = [...body.values()].filter((held) => copies.some((copy) => copy.blob !== held.blob && supersedes(copy, held))).map((held) => held.plan);
  return { lines, cards, changed };
}

const json = (value) => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');

export const dataBlock = (data) => `<script type="application/json" id="plan-page-data">${json(data)}</script>`;

export const MOUNTS = {
  live: '<section class="live" id="plan-page-live" hidden></section>',
  others: '<section class="others" id="plan-page-others" hidden></section>',
};

const STATE_WORDS = { working: 'working', waiting: 'waits on you', blocked: 'blocked', done: 'done' };
const WINDOW = 1000;

async function deck(collection, words, size) {
  const data = JSON.parse(document.getElementById('plan-page-data')?.textContent || 'null');
  const live = document.getElementById('plan-page-live');
  const others = document.getElementById('plan-page-others');
  if (!data || !live || !others || !window.claude?.use) return;
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const say = (text) => {
    others.replaceChildren(node('h2', '', 'Other runs'), node('p', 'deck-note', text));
    others.hidden = false;
  };
  const db = await window.claude.use('db');
  if (!db) return say('Other runs and their live stages show here on claude.ai, signed in.');
  const when = (at) => `${at.slice(0, 16).replace('T', ' ')} UTC`;
  const memo = (ask) => {
    const item = node('div', 'q', '');
    const options = ask.options ?? [];
    const head = (options.length ? ask.question : ask.header) || ask.question || ask.header;
    if (head) item.append(node('h4', '', head));
    if (!options.length) for (const line of ask.lines ?? []) item.append(node('p', '', line));
    else {
      if (ask.why) item.append(node('p', 'ctx', ask.why));
      for (const fact of ask.facts ?? []) item.append(node('p', 'fact', fact));
      if (ask.multi) item.append(node('p', 'ctx', 'Pick any.'));
      for (const option of options) item.append(node('p', 'opt', `${option.recommended ? 'Pick: ' : ''}${option.label}. ${option.does} Cost: ${option.cost}`));
      if (ask.reason) item.append(node('p', 'why', `Why this pick: ${ask.reason}`));
      if (!options.some((option) => option.recommended)) item.append(node('p', 'nopick', ask.go || 'No pick: choose one.'));
      for (const line of ask.rest ?? []) item.append(node('p', '', line));
    }
    if (ask.attention) item.append(node('p', 'fact', `Attention: ${ask.attention}`));
    return item;
  };
  const card = (copy, used) => {
    const element = node('article', 'card run', '');
    const id = `run-${copy.slug}`;
    if (!document.getElementById(id) && !used.has(id)) {
      element.id = id;
      used.add(id);
    }
    element.append(node('h3', '', copy.title), node('p', 'status-line', copy.status));
    if (copy.brief) element.append(node('p', '', `Changes: ${copy.brief.changes}`), node('p', '', `Risks: ${copy.brief.risks}`));
    for (const ask of copy.asks) element.append(memo(ask));
    for (const pick of copy.picks) element.append(node('p', 'pick', `${pick.decision}: ${pick.pick} (${pick.level}). Alternative: ${pick.alternative}; say ${pick.word}.`));
    const by = `session ${copy.session.slice(0, 8)}`;
    element.append(node('p', 'from', copy.stop ? `Handed back by ${by} at ${when(copy.at)}` : `Saved by ${by}; this copy dates from ${when(copy.at)}`));
    return element;
  };
  let marks = [];
  let landed = false;
  const draw = (docs) => {
    const model = deckModel(docs, data, Date.now());
    live.replaceChildren(
      ...model.lines.map((line) => node('p', `live-line ${line.state}`, `${line.title}: ${line.stage ?? 'no stage'}, ${words[line.state] ?? line.state} · since ${when(line.since)}${line.quiet ? ` · last wrote ${when(line.at)}` : ''}`))
    );
    live.hidden = model.lines.length === 0;
    others.replaceChildren();
    const used = new Set();
    if (model.cards.length) others.append(node('h2', '', 'Other runs'), ...model.cards.map((copy) => card(copy, used)));
    others.hidden = model.cards.length === 0;
    for (const mark of marks) mark.remove();
    marks = [];
    for (const plan of model.changed) {
      const item = [...document.querySelectorAll('[data-plan]')].find((element) => element.getAttribute('data-plan') === plan);
      if (!item) continue;
      const mark = node('span', 'changed', 'Changed since this page was published; the newer copy is under Other runs.');
      item.prepend(mark);
      marks.push(mark);
    }
    if (landed) return;
    const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    landed = true;
    target.scrollIntoView();
  };
  const notes = db.collection(collection).orderBy('at', 'desc');
  const read = { live: [], backfill: [] };
  let backfilled = false;
  const fail = () => say('Other runs stopped updating. Reload the page.');
  const backfillOnce = async (snapshot) => {
    const seen = new Set(snapshot.docs.map((doc) => doc.id));
    let oldest = read.live.at(-1).at;
    for (;;) {
      const next = await notes.where('at', '<=', oldest).limit(size).get();
      const fresh = next.docs.filter((doc) => !seen.has(doc.id));
      for (const doc of fresh) {
        seen.add(doc.id);
        read.backfill.push(doc.data());
      }
      if (!fresh.length || next.size < size) return;
      oldest = fresh.at(-1).data().at;
    }
  };
  notes.limit(size).onSnapshot(async (snapshot) => {
    read.live = snapshot.docs.map((doc) => doc.data());
    if (snapshot.size === size && !backfilled) {
      backfilled = true;
      await backfillOnce(snapshot).catch(fail);
    }
    draw([...read.live, ...read.backfill]);
  }, fail);
}

export const DECK_SCRIPT = `<script id="plan-page-deck">(() => {
const asking = ${asking};
${supersedes}
${deckModel}
(${deck})(${JSON.stringify(COLLECTION)}, ${JSON.stringify(STATE_WORDS)}, ${WINDOW});
})();</script>`;
