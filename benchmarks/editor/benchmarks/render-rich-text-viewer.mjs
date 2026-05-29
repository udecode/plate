import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const resultPath =
  args.result || 'benchmarks/results/rich-text-editors-latest.json';
const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
const slateV2InternalCategories = new Set([
  'slate-6038-transaction-execution',
  'slate-clipboard-large-payload',
  'slate-clipboard-large-payload-threshold',
  'slate-collab-readiness',
  'slate-collab-readiness-invariant',
  'slate-core-editor-store',
  'slate-core-node-transforms',
  'slate-core-normalization-current',
  'slate-core-query-ref-observation',
  'slate-core-refs-projection',
  'slate-core-text-selection',
  'slate-core-transaction-current',
  'slate-history-retained-memory',
  'slate-react-active-typing-breakdown',
  'slate-react-huge-document-overlays',
  'slate-react-rerender-breadth',
]);
const comparisonWorkloadFixtures = new Set([
  'browser-rich-text-replay-coverage',
  'core-compare',
  'core-rich-text-operations-compare',
  'history-compare',
  'react-huge-document-browser-trace',
  'react-huge-document-legacy-compare',
]);
const views = [
  {
    dataPath: args.data || 'docs/perf/rich-text-data.json',
    description:
      'Apples-to-apples benchmark rows only. Slate v2 internal diagnostics live on the internals page.',
    htmlPath: args.html || 'docs/perf/rich-text.html',
    includeRow: isComparisonRow,
    nav: [{ href: 'slate-v2-internals.html', label: 'Slate v2 internals' }],
    title: 'rich-text-editor comparison results',
  },
  {
    dataPath: args.internalsData || 'docs/perf/slate-v2-internals-data.json',
    description:
      'Slate v2-only architecture, runtime, and diagnostic proof rows. These are not editor-framework comparisons.',
    htmlPath: args.internalsHtml || 'docs/perf/slate-v2-internals.html',
    includeRow: isSlateV2InternalRow,
    nav: [{ href: 'rich-text.html', label: 'Comparison results' }],
    title: 'slate-v2 internal proof results',
  },
];

if (args.check) {
  for (const view of views) {
    const output = renderView(result, view);
    assertFileEquals(view.htmlPath, output.html);
    assertFileEquals(view.dataPath, output.dataJson);
    console.log(`checked ${view.htmlPath} and ${view.dataPath}`);
  }
} else {
  for (const view of views) {
    const output = renderView(result, view);
    fs.mkdirSync(path.dirname(view.htmlPath), { recursive: true });
    fs.mkdirSync(path.dirname(view.dataPath), { recursive: true });
    fs.writeFileSync(view.htmlPath, output.html);
    fs.writeFileSync(view.dataPath, output.dataJson);
    console.log(`wrote ${view.htmlPath}`);
    console.log(`wrote ${view.dataPath}`);
  }
}

function renderView(payload, view) {
  const data = buildViewerData(payload, view);
  const dataFile = path
    .relative(path.dirname(view.htmlPath), view.dataPath)
    .split(path.sep)
    .join('/');

  return {
    dataJson: `${JSON.stringify(data)}\n`,
    html: renderHtml({
      ...view,
      dataFile,
      dataVersion: data.generatedAt || '',
    }),
  };
}

function buildViewerData(payload, view = {}) {
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const formattedRows = rows
    .filter(view.includeRow || (() => true))
    .map(formatRow);
  const libraries = sortLibraries(
    unique(formattedRows.map((row) => row.library))
  );
  const statusCounts = countBy(formattedRows, (row) => row.status || 'unknown');
  const categoryCounts = countBy(
    formattedRows,
    (row) => row.category || 'unknown'
  );
  const groups = buildGroups(formattedRows);
  const missingRows = formattedRows.filter((row) =>
    [
      'adapter-missing',
      'coverage-gap',
      'missing-artifact',
      'optional-missing-artifact',
    ].includes(row.status)
  );

  return {
    categoryCounts,
    generatedAt: payload.generatedAt,
    groups,
    libraries,
    missingRows,
    name: view.title || payload.name,
    rowCount: formattedRows.length,
    statusCounts,
  };
}

function isComparisonRow(row) {
  if (slateV2InternalCategories.has(row.category)) return false;
  if (row.category === 'rich-text-editor-workload-coverage') {
    return comparisonWorkloadFixtures.has(row.fixture);
  }

  return true;
}

function isSlateV2InternalRow(row) {
  return slateV2InternalCategories.has(row.category);
}

function buildGroups(rows) {
  const grouped = new Map();

  for (const row of rows) {
    let group = grouped.get(row.category);
    if (!group) {
      group = {
        category: row.category,
        libraries: [],
        rows: [],
      };
      grouped.set(row.category, group);
    }

    let tableRow = group.rows.find(
      (candidate) => candidate.fixture === row.fixture
    );
    if (!tableRow) {
      tableRow = {
        cells: {},
        fixture: row.fixture,
      };
      group.rows.push(tableRow);
    }

    tableRow.cells[row.library] = compactCell(row);
    if (!group.libraries.includes(row.library))
      group.libraries.push(row.library);
  }

  return Array.from(grouped.values()).map((group) => ({
    ...group,
    libraries: sortLibraries(group.libraries),
  }));
}

function formatRow(row) {
  return {
    category: row.category,
    fixture: row.fixture,
    library: row.library,
    medianUs: toNumber(row.medianUs),
    note: row.note || '',
    ops: toNumber(row.ops),
    p95Us: toNumber(row.p95Us),
    status: row.status || 'unknown',
  };
}

function compactCell(row) {
  const cell = {
    status: row.status,
  };
  if (row.medianUs !== null) cell.medianUs = row.medianUs;
  if (row.p95Us !== null) cell.p95Us = row.p95Us;
  if (row.ops !== null) cell.ops = row.ops;
  if (row.status !== 'ok' && row.note) cell.note = row.note;
  return cell;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function countBy(items, readKey) {
  const counts = {};
  for (const item of items) {
    const key = readKey(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))
  );
}

function unique(items) {
  return Array.from(new Set(items));
}

function sortLibraries(libraries) {
  const rank = new Map(
    [
      'slate-v2',
      'slate-v2:default-render-auto',
      'slate-v2:dom-present',
      'slate-v2:current',
      'slate-v2:core-current',
      'slate-v2:browser-trace',
      'slate-v2:browser-replay',
      'slate-v2:react-rerender-breadth',
      'slate-v2:react-overlays',
      'slate-v2:react-active-typing',
      'slate-v2:clipboard',
      'slate-v2:collab-readiness',
      'slate-v2:transaction-execution',
      'slate-v2:history-memory',
      'slate',
      'slate:baseline',
      'slate:chunk-on',
      'slate:browser-trace',
      'slate:browser-replay',
    ].map((library, index) => [library, index])
  );

  return [...libraries].sort(
    (left, right) =>
      (rank.get(left) ?? 1000) - (rank.get(right) ?? 1000) ||
      left.localeCompare(right)
  );
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]
  );
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function renderHtml({
  dataFile,
  dataVersion = '',
  description,
  nav = [],
  title,
}) {
  const navLinks = nav
    .map(
      (item) =>
        `<a href="${escapeAttribute(item.href)}">${escapeHtml(item.label)}</a>`
    )
    .join(' | ');
  const dataUrl = dataVersion
    ? `${dataFile}?v=${encodeURIComponent(dataVersion)}`
    : dataFile;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      *,:before,:after{box-sizing:border-box}
      body{margin:0;padding:.5rem;font-family:Helvetica,Arial,sans-serif;font-size:14px}
      a,a:active,a:hover{text-decoration:none}
      :root{--border-color:#ccc}
      .container{width:100%;max-width:100%}
      .known-issues{margin-top:20px}
      .known-issues__issue-code{float:left;width:50px;margin:0;padding:0}
      .selector-content-container{position:relative}
      @media screen and (width>=640px){.selector-content-container__content.grid .selector-content-container__content-wrapper{column-count:2}}
      @media screen and (width>=1024px){.selector-content-container__content.grid .selector-content-container__content-wrapper{column-count:3}}
      .mode-selector__label{margin-right:.5rem}
      .copy-paste-panel{align-items:center;gap:.5rem;display:flex}
      .copy-paste-panel__buttons{gap:.5rem;display:flex}
      .select-toolbar{border-top:1px solid var(--border-color);border-bottom:1px solid var(--border-color);background-color:#fafafa;grid-template-rows:auto auto auto;gap:1rem;padding:.5rem 0;display:grid}
      .select-toolbar__actions{gap:1rem;display:flex;flex-wrap:wrap}
      @media screen and (width>=1024px){.select-toolbar{display:flex;align-items:start}}
      .selector{border:1px solid var(--border-color);background:#fff;margin:.25rem 0;padding:.5rem}
      .selector summary{cursor:pointer}
      .selector label{break-inside:avoid;display:block;margin:.125rem 0}
      .results{width:100%;max-width:100%;overflow:auto;margin-top:1rem}
      .results__table{table-layout:fixed;border-collapse:collapse;width:max-content;min-width:100%;font-size:11px}
      .results__table th{z-index:9;text-align:center;word-break:normal;-webkit-hyphens:auto;hyphens:auto;width:78px;font-size:11px;font-weight:400}
      .results__table th.benchname{width:180px}
      .results__table th,.results__table td{border:1px solid #ddd;padding:3px}
      .results__table th:first-child,.results__table td:first-child{background-color:#fff;width:180px;position:sticky;left:0}
      .results__table th:first-child:before,.results__table td:not(.description):first-child:before,.results__table th:first-child:after,.results__table td:not(.description):first-child:after{content:"";background-color:#ddd;width:1px;position:absolute;top:0;bottom:0}
      .results__table th:first-child:before,.results__table td:first-child:before{left:-1px}
      .results__table th:first-child:after,.results__table td:first-child:after{right:-1px}
      .results__table td{text-align:center;vertical-align:top}
      .results__table td.benchname{text-align:left}
      .results__table td.description{text-align:left;border:0;height:42px;overflow:visible;padding:0!important}
      td>h3{background-color:#fff;width:800px;height:40px;margin:0;padding:10px;font-size:16px;position:absolute;left:0}
      .rowCount{font-size:10px}
      .deviation{padding-left:5px;font-size:8px}
      .deviation:before{content:"± "}
      .factor{display:block;font-size:8px}
      .sort-key{text-decoration:underline}
      dl{width:100%;margin-bottom:16px;padding:0;overflow:hidden}
      dt{float:left;width:96px;margin:0;padding:0}
      dd{margin:0;padding:0}
      .with-issues{background-color:#faa}
      .button{cursor:pointer}
      .button__text{color:#00e;font-size:inherit;background:0 0;border:none;padding:0}
      .button__text:disabled{color:#666;font-weight:400}
      .error{background-color:#f99}
      .warning{background-color:#ff6}
      .ok{background-color:#cfc}
      .missing{background-color:#eee;color:#555}
      .slow-1{background-color:#f8f8d0}
      .slow-2{background-color:#ffe0a3}
      .slow-3{background-color:#ffb0a3}
      .filtered{display:none}
      .small{font-size:11px}
      .summary-line{margin:.25rem 0}
      select{font-size:14px}
      h2{font-size:1.5em;margin:.83em 0}
      p{max-width:1050px}
      .nav{margin:.5rem 0}
    </style>
  </head>
  <body>
    <div id="root" class="container">
      <div>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
        <p class="nav">${navLinks}</p>
      </div>
      <p id="runInfo">Loading benchmark data...</p>
        <p>Lower duration is better. Factor values are normalized against the fastest measured implementation in the same row.</p>
      <main>
        <div class="select-toolbar">
          <div class="select-toolbar__actions">
            <details class="selector" open>
              <summary>Which frameworks?</summary>
              <div id="frameworkSelector" class="selector-content-container__content grid">
                <div class="selector-content-container__content-wrapper"></div>
              </div>
            </details>
            <details class="selector">
              <summary>Which benchmarks?</summary>
              <div id="benchmarkSelector" class="selector-content-container__content grid">
                <div class="selector-content-container__content-wrapper"></div>
              </div>
            </details>
          </div>
          <div class="copy-paste-panel">
            <div>Copy/paste current selection</div>
            <div class="copy-paste-panel__buttons">
              <button id="copyState" class="button button__text" type="button">Copy</button>
              <button id="pasteState" class="button button__text" type="button">Paste</button>
            </div>
          </div>
          <div class="select-toolbar__actions">
            <div class="mode-selector">
              <label class="mode-selector__label" for="displayMode">Display mode:</label>
              <select id="displayMode">
                <option value="medianUs">median results</option>
                <option value="p95Us">p95 results</option>
                <option value="ops">ops/status</option>
              </select>
            </div>
            <div>
              <label class="mode-selector__label" for="sortMode">Sort:</label>
              <select id="sortMode">
                <option value="source">source order</option>
                <option value="name">benchmark name</option>
                <option value="slowest">slowest selected row</option>
              </select>
            </div>
          </div>
        </div>
        <div id="results"></div>
        <section class="known-issues">
          <h2>Known issues and notes</h2>
          <dl id="summary"></dl>
          <ul id="issues"></ul>
        </section>
      </main>
    </div>
    <script>
      const state = {
        data: null,
        displayMode: "medianUs",
        selectedCategories: new Set(),
        selectedLibraries: new Set(),
        sortMode: "source",
      };

      fetch(${JSON.stringify(dataUrl)}, { cache: "no-store" })
        .then((response) => response.json())
        .then((data) => {
          state.data = data;
          state.selectedLibraries = new Set(data.libraries);
          state.selectedCategories = new Set(data.groups.map((group) => group.category));
          renderSelectors();
          bindControls();
          render();
        });

      function bindControls() {
        document.getElementById("displayMode").addEventListener("change", (event) => {
          state.displayMode = event.target.value;
          render();
        });
        document.getElementById("sortMode").addEventListener("change", (event) => {
          state.sortMode = event.target.value;
          render();
        });
        document.getElementById("copyState").addEventListener("click", copyState);
        document.getElementById("pasteState").addEventListener("click", pasteState);
      }

      function renderSelectors() {
        const frameworkRoot = document.querySelector("#frameworkSelector .selector-content-container__content-wrapper");
        frameworkRoot.innerHTML = [
          checkbox("library", "__all", "All", true),
          checkbox("library", "__none", "None", false),
          ...state.data.libraries.map((library) => checkbox("library", library, library, true)),
        ].join("");

        const benchmarkRoot = document.querySelector("#benchmarkSelector .selector-content-container__content-wrapper");
        benchmarkRoot.innerHTML = [
          checkbox("category", "__all", "All", true),
          checkbox("category", "__none", "None", false),
          ...state.data.groups.map((group) => checkbox("category", group.category, titleCase(group.category), true)),
        ].join("");

        frameworkRoot.addEventListener("change", (event) => {
          updateSelection(event, state.selectedLibraries, state.data.libraries, "library");
        });
        benchmarkRoot.addEventListener("change", (event) => {
          updateSelection(event, state.selectedCategories, state.data.groups.map((group) => group.category), "category");
        });
      }

      function updateSelection(event, selected, allValues, name) {
        const value = event.target.value;
        if (value === "__all") {
          selected.clear();
          for (const item of allValues) selected.add(item);
        } else if (value === "__none") {
          selected.clear();
        } else if (event.target.checked) {
          selected.add(value);
        } else {
          selected.delete(value);
        }

        document.querySelectorAll(\`input[name="\${name}"]\`).forEach((input) => {
          if (input.value === "__all") input.checked = selected.size === allValues.length;
          else if (input.value === "__none") input.checked = selected.size === 0;
          else input.checked = selected.has(input.value);
        });
        render();
      }

      function checkbox(name, value, label, checked) {
        return \`<label><input type="checkbox" name="\${name}" value="\${escapeHtml(value)}" \${checked ? "checked" : ""}> \${escapeHtml(label)}</label>\`;
      }

      function render() {
        const data = state.data;
        document.getElementById("runInfo").textContent =
          \`The benchmark has \${data.rowCount} rows, generated at \${data.generatedAt || "unknown time"}.\`;
        renderSummary();
        renderTables();
        renderIssues();
      }

      function renderSummary() {
        const counts = Object.entries(state.data.statusCounts);
        document.getElementById("summary").innerHTML = counts
          .map(([status, count]) => \`<dt>\${escapeHtml(status)}</dt><dd>\${count}</dd>\`)
          .join("");
      }

      function renderTables() {
        const groups = state.data.groups
          .filter((group) => state.selectedCategories.has(group.category))
          .map((group) => ({
            ...group,
            libraries: group.libraries.filter((library) => state.selectedLibraries.has(library)),
            rows: sortRows(group.rows),
          }))
          .filter((group) => group.libraries.length > 0);

        document.getElementById("results").innerHTML = groups
          .map((group) => renderGroupTable(group))
          .join("");
      }

      function renderGroupTable(group) {
        const head = [
          '<th class="benchname">benchmark</th>',
          ...group.libraries.map((library) => \`<th>\${escapeHtml(library)}</th>\`),
        ].join("");
        const body = group.rows
          .map((row) => renderTableRow(row, group.libraries))
          .join("");

        return \`
          <div class="results">
            <table class="results__table">
              <thead>
                <tr><td class="description" colspan="\${group.libraries.length + 1}"><h3>\${escapeHtml(titleCase(group.category))}</h3></td></tr>
                <tr>\${head}</tr>
              </thead>
              <tbody>\${body}</tbody>
            </table>
          </div>
        \`;
      }

      function renderTableRow(row, libraries) {
        const values = libraries
          .map((library) => row.cells[library])
          .filter(Boolean)
          .map((cell) => readMetric(cell))
          .filter((value) => Number.isFinite(value) && value > 0);
        const best = Math.min(...values);
        const cells = libraries
          .map((library) => renderCell(row.cells[library], best))
          .join("");
        return \`<tr><td class="benchname">\${escapeHtml(shortFixture(row.fixture))}</td>\${cells}</tr>\`;
      }

      function renderCell(cell, best) {
        if (!cell) return '<td class="missing">-</td>';
        if (cell.status !== "ok") {
          return \`<td class="\${statusClass(cell.status)}" title="\${escapeHtml(cell.note || "")}">\${escapeHtml(cell.status)}</td>\`;
        }

        const value = readMetric(cell);
        if (!Number.isFinite(value)) {
          return \`<td class="ok" title="\${escapeHtml(cell.note || "")}">ok<span class="rowCount">\${cell.ops ?? ""}</span></td>\`;
        }

        const factor = Number.isFinite(best) && best > 0 ? value / best : 1;
        return \`
          <td class="\${factorClass(factor)}" title="\${escapeHtml(cell.note || "")}">
            <span>\${formatValue(value)}</span>
            <span class="factor">\${factor.toFixed(2)}x</span>
            \${cell.ops ? \`<span class="rowCount">(\${cell.ops})</span>\` : ""}
          </td>
        \`;
      }

      function renderIssues() {
        const rows = state.data.missingRows.slice(0, 120);
        document.getElementById("issues").innerHTML = rows
          .map((row, index) => \`
            <li>
              <a id="issue-\${index + 1}" href="#issue-\${index + 1}">\${index + 1}</a>
              \${escapeHtml(row.library)} / \${escapeHtml(row.fixture)}: \${escapeHtml(row.status)}
              <span class="small">\${escapeHtml(row.note)}</span>
            </li>
          \`)
          .join("");
      }

      function sortRows(rows) {
        const copied = [...rows];
        if (state.sortMode === "name") {
          return copied.sort((left, right) => left.fixture.localeCompare(right.fixture));
        }
        if (state.sortMode === "slowest") {
          return copied.sort((left, right) => rowMax(right) - rowMax(left));
        }
        return copied;
      }

      function rowMax(row) {
        return Math.max(
          0,
          ...Object.values(row.cells)
            .map((cell) => readMetric(cell))
            .filter((value) => Number.isFinite(value))
        );
      }

      function readMetric(cell) {
        return cell?.[state.displayMode] ?? null;
      }

      function formatValue(value) {
        if (state.displayMode === "ops") return String(value);
        const ms = value / 1000;
        if (ms >= 100) return \`\${ms.toFixed(0)}ms\`;
        if (ms >= 10) return \`\${ms.toFixed(1)}ms\`;
        return \`\${ms.toFixed(2)}ms\`;
      }

      function factorClass(factor) {
        if (factor >= 10) return "slow-3";
        if (factor >= 3) return "slow-2";
        if (factor >= 1.5) return "slow-1";
        return "ok";
      }

      function statusClass(status) {
        if (status === "over-budget") return "error";
        if (status === "adapter-missing") return "with-issues";
        if (status === "coverage-gap") return "with-issues";
        if (status === "optional-missing-artifact") return "warning";
        return "missing";
      }

      async function copyState() {
        const snapshot = JSON.stringify({
          displayMode: state.displayMode,
          libraries: [...state.selectedLibraries],
          categories: [...state.selectedCategories],
          sortMode: state.sortMode,
        });
        await navigator.clipboard.writeText(snapshot);
      }

      async function pasteState() {
        const snapshot = JSON.parse(await navigator.clipboard.readText());
        if (Array.isArray(snapshot.libraries)) state.selectedLibraries = new Set(snapshot.libraries);
        if (Array.isArray(snapshot.categories)) state.selectedCategories = new Set(snapshot.categories);
        if (snapshot.displayMode) state.displayMode = snapshot.displayMode;
        if (snapshot.sortMode) state.sortMode = snapshot.sortMode;
        document.getElementById("displayMode").value = state.displayMode;
        document.getElementById("sortMode").value = state.sortMode;
        renderSelectors();
        render();
      }

      function shortFixture(fixture) {
        return fixture.split("/").slice(-3).join("/");
      }

      function titleCase(value) {
        return value
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char]);
      }
    </script>
  </body>
</html>
`;
}

function assertFileEquals(filePath, expected) {
  let current;
  try {
    current = fs.readFileSync(filePath, 'utf8');
  } catch {
    throw new Error(`missing generated file: ${filePath}`);
  }
  if (current !== expected) {
    throw new Error(`generated file is stale: ${filePath}`);
  }
}

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    if (key === 'check') {
      out.check = true;
      continue;
    }

    out[key] = argv[i] || true;
    i++;
  }

  return out;
}
