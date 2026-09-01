import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  createInputDigest,
  createProofReceiptId,
  validateRegressionPlan,
} from "./validate-regression-plan.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const semanticTestPath =
  ".agents/rules/regression/scripts/validate-regression-plan.test.mjs";
const semanticTestTitle = "complete fixture satisfies semantic closure";
const receiptInputs = [
  ".agents/rules/regression/scripts/capture-proof-receipt.mjs",
  ".agents/rules/regression/scripts/validate-regression-plan.mjs",
  semanticTestPath,
];
const digest = createInputDigest(root, receiptInputs);
const proofTimes = {
  ended: "2026-08-20T10:02:00.000Z",
  latestInput: "2026-08-20T10:00:00.000Z",
  started: "2026-08-20T10:01:00.000Z",
};

const receiptRow = ({
  attempt = 1,
  caseId = "case-complete",
  host = "host:none - deterministic Node workflow",
  inputDigest = digest,
} = {}) => {
  const baseUrl = host.match(/\bbase-url:([^;]+)/i)?.[1];
  const receipt = {
    attempt: String(attempt),
    caseId,
    claim: "completed",
    command: `${baseUrl ? `PLAYWRIGHT_BASE_URL=${baseUrl} ` : ""}node --test validate-regression-plan.test.mjs`,
    host,
    inputCount: "3",
    inputDigest,
    inputs: receiptInputs.join(","),
    latestInputMtime: proofTimes.latestInput,
    proofEnded: proofTimes.ended,
    proofStarted: proofTimes.started,
    ref: `commit:${"1".repeat(40)}`,
    result: "pass: semantic workflow proof",
    retries: "0",
  };

  return `| ${caseId} | ${attempt} | completed | ${receipt.command} | ${
    receipt.result
  } | ${receipt.ref} | ${inputDigest} | 3 | ${receipt.inputs} | ${host} | ${
    proofTimes.latestInput
  } | ${proofTimes.started} | ${proofTimes.ended} | 0 | ${createProofReceiptId(
    receipt
  )} |`;
};

const oracleRows = ({
  browserCommand = false,
  captureRoutingPath = false,
  exactChrome = false,
  externalInterceptorPath = false,
  focusFirstClick = false,
  physicalHitPath = false,
  missingForbidden = false,
  missingPixelControls = false,
  missingPopupFollowUp = false,
  popupLifecycle = false,
  popupSamePhaseOracles = true,
  reporterProfile = false,
  reporterProfileToolProof = false,
} = {}) => {
  const rows = [
    {
      applies: "yes",
      forbidden: missingForbidden
        ? "pending"
        : "an incomplete semantic plan passes",
      layer: "package",
      observation: "model",
      positive: "the complete semantic plan passes",
      result: "pass: validator contract",
    },
    ...(browserCommand
      ? [
          {
            applies: "yes",
            forbidden: "the detached root editor handles the command alone",
            layer: "Browser mounted runtime diagnostic",
            observation: "dom-native",
            positive: "the mounted runtime owner handles the keyboard trigger",
            result: "pass: mounted command dispatched",
          },
        ]
      : []),
    ...[
      ...(browserCommand ? [] : ["dom-native"]),
      "pointer-feedback",
      "focus",
      "popup",
      "subscription-lifecycle",
      "runtime-errors",
      "follow-up-input",
    ].map((observation) => {
      if (focusFirstClick) {
        const clickOracle = {
          "dom-native": {
            forbidden: "the first click is consumed before click delivery",
            positive: `event-order: pointerdown>mousedown>focus>click from one gesture${
              physicalHitPath ? "; physical-hit-target: date-button" : ""
            }${
              captureRoutingPath
                ? "; interaction-owner-chain: date-button -> inline-void -> editable; capture-routing-contract: draggable on inline-void"
                : ""
            }`,
            result: `pass: event-order: pass${
              physicalHitPath
                ? "; physical-hit-target: pass; click-delivery: pass"
                : ""
            }${
              captureRoutingPath
                ? "; interaction-owner-chain: pass; capture-routing-contract: pass"
                : ""
            }${
              externalInterceptorPath
                ? "; external-interceptor-isolated: pass"
                : ""
            }`,
          },
          focus: {
            forbidden: "the test starts from a different focus state",
            positive: `initial-focus: editor-text-caret-before-date; before pointerdown; focus-stability: settled + follow-up-key${
              physicalHitPath ? "; selection-origin: physical-pointer" : ""
            }`,
            result: `pass: initial-focus: pass; settled-focus: pass; follow-up-key: pass${
              physicalHitPath ? "; selection-origin: pass" : ""
            }`,
          },
          popup: {
            forbidden: "the popup waits for a second click",
            positive: "first-click-popup: open immediately after click",
            result: "pass: first-click-popup: pass",
          },
          "runtime-errors": {
            forbidden: "the first click throws",
            positive: "the first gesture emits no runtime error",
            result: "pass: no runtime error",
          },
          "follow-up-input": {
            forbidden: "the opened popup ignores its next input",
            positive: "the opened popup accepts the next input",
            result: "pass: follow-up input",
          },
        }[observation];

        if (clickOracle) {
          return {
            applies: "yes",
            layer:
              reporterProfile
                ? `exact-chrome reporter-profile browser${
                    reporterProfileToolProof ? " computer-use" : ""
                  }`
                : observation === "focus" ||
                    physicalHitPath ||
                    captureRoutingPath ||
                    externalInterceptorPath
                ? "browser"
                : "dom",
            observation,
            ...clickOracle,
            result: `${clickOracle.result}${
              reporterProfile &&
              ["dom-native", "focus", "popup"].includes(observation)
                ? "; reporter-profile-replay: pass"
                : ""
            }`,
          };
        }
      }

      const applies =
        popupLifecycle &&
        (observation === "popup" ||
          (observation === "follow-up-input" && !missingPopupFollowUp));

      return applies
        ? {
            applies: "yes",
            forbidden:
              observation === "popup"
                ? "the closed popup remains visible"
                : "the owning surface ignores the next input",
            layer: "dom",
            observation,
            positive:
              observation === "popup"
                ? "the popup closes after the action"
                : "the owning surface accepts the next input",
            result: "pass: popup lifecycle workflow contract",
          }
        : {
            applies: "no",
            forbidden: "N/A: deterministic workflow case",
            layer: "N/A: deterministic workflow case",
            observation,
            positive: "N/A: deterministic workflow case",
            result: "N/A: deterministic workflow case",
          };
    }),
    exactChrome
      ? {
          applies: "yes",
          forbidden: "stale Blink paint remains visible",
          layer: "exact-chrome pixel classifier",
          observation: "geometry-paint",
          positive: "paint matches final geometry",
          result: missingPixelControls
            ? "pass: exact Chrome pixel oracle"
            : "pass: exact Chrome pixel oracle; positive-control: pass known single-layer state; negative-control: pass known-absent state; duplicate-control: pass known duplicate-layer state rejected",
        }
      : {
          applies: "no",
          forbidden: "N/A: no rendered geometry",
          layer: "N/A: no rendered geometry",
          observation: "geometry-paint",
          positive: "N/A: no rendered geometry",
          result: "N/A: no rendered geometry",
        },
  ];

  return rows
    .map((row) => {
      const phase =
        row.observation === "follow-up-input"
          ? "follow-up"
          : popupLifecycle &&
            !popupSamePhaseOracles &&
            ["dom-native", "focus"].includes(row.observation)
          ? "follow-up"
          : ["geometry-paint", "pointer-feedback"].includes(row.observation)
          ? "during-action"
          : "after-action";

      return `| case-complete | ${row.observation} | ${phase} | ${
        row.applies
      } | ${row.positive} | ${row.forbidden} | ${row.layer} | ${
        row.applies === "yes"
          ? `test: ${semanticTestPath}#${semanticTestTitle}`
          : "N/A: deterministic workflow case"
      } | ${row.result} |`;
    })
    .join("\n");
};

const reporterEvidenceRows = ({
  anchorToInapplicableOracle = false,
  failedCount = 0,
  failureKind = "reporter-contradiction",
  focusFirstClick = false,
  captureRoutingPath = false,
  externalInterceptorPath = false,
  physicalHitPath = false,
  missingBase = false,
  missingLatestReporterDelta = false,
  missingOracle = false,
  preImplementation = false,
  reporterProfile = false,
  supersededBase = false,
} = {}) => {
  const result = preImplementation
    ? "red: reporter claim reproduced"
    : "pass: cumulative reporter claim proved";
  const rows = [];

  if (failedCount > 0 && !missingBase) {
    rows.push(
      supersededBase
        ? "| case-complete | base-acceptance | issue body acceptance criteria | during-action | preserve the original visual interaction | superseded: current product law replaced this acceptance | N/A: superseded acceptance | N/A: superseded acceptance | N/A: superseded acceptance |"
        : `| case-complete | base-acceptance | issue body acceptance criteria | after-action | preserve the original semantic result | required | model@after-action | test: ${semanticTestPath}#${semanticTestTitle} | ${result} |`
    );
  }
  if (
    failedCount === 0 ||
    (failureKind === "reporter-contradiction" && !missingLatestReporterDelta)
  ) {
    rows.push(
      `| case-complete | ${
        failedCount > 0 ? "latest-reporter-delta" : "current-report"
      } | ${
        focusFirstClick
          ? `latest reporter evidence: ${
              reporterProfile
                ? "reporter-profile: Chrome Dev Profile with Agentation state; "
                : ""
            }${
              physicalHitPath
                ? "physical-hit-path: word-dates -> date-button; "
                : ""
            }${
              captureRoutingPath
                ? "capture-routing-path: date-button -> inline-void -> editable; "
                : ""
            }${
              externalInterceptorPath
                ? "interaction-interceptor-path: Agentation-document-capture -> date-button; external-interceptor-state: active blockInteractions=true; "
                : ""
            }first click focuses and second click opens`
          : "latest reporter evidence"
      } | after-action | ${
        focusFirstClick
          ? "initial-focus: editor-text-caret-before-date; one click opens the popup immediately"
          : "semantic closure matches the cumulative report"
      } | required | ${
        focusFirstClick
          ? "dom-native@after-action, focus@after-action, popup@after-action, follow-up-input@follow-up"
          : missingOracle
            ? "focus@during-action"
            : anchorToInapplicableOracle
              ? "focus@after-action"
              : "model@after-action"
      } | test: ${semanticTestPath}#${semanticTestTitle} | ${result} |`
    );
  }

  return rows.join("\n");
};

const noFailedFixRow =
  "| none | 0 | N/A: no claimed fix failed | N/A: no failed-fix kind | N/A: no prior claim | N/A: no repair | N/A: no repair test | no: no failure | N/A: no escalation | N/A: no resume |";
const noGateFailureRow =
  "| none | N/A: no started gate failed | N/A: no failure | N/A: no repair | N/A: no rerun required |";

const failedFixRows = ({
  count = 1,
  failureKind = "reporter-contradiction",
  invalidate = true,
  repair = true,
} = {}) =>
  Array.from({ length: count }, (_, index) => {
    const attempt = index + 1;
    const architecture =
      attempt >= 2
        ? "best-api: accepted durable API; plate-plan: accepted adoption plan"
        : "N/A: first failed fix without architecture pressure";

    const diagnostic =
      failureKind === "reporter-contradiction"
        ? ""
        : "; diagnostic: pass unchanged-bytes failing phase classified";

    return `| case-complete | ${attempt} | reporter contradiction after claimed candidate | ${failureKind} | ${
      invalidate ? "yes: prior green and completion receipt revoked" : "no"
    } | ${
      repair
        ? "repair-now: .agents/rules/regression/scripts/validate-regression-plan.mjs"
        : "no-change: existing prose looked sufficient"
    } | pass: workflow rejection test | ${
      attempt >= 2
        ? "yes: second-failed-fix"
        : "no: first failure and no structural pressure"
    } | ${architecture} | reproduced: restart the exact reporter case${diagnostic} |`;
  }).join("\n");

const fixture = ({
  anchorToInapplicableOracle = false,
  architectureVerdict = "patch",
  browserCommand = false,
  captureRoutingPath = false,
  exactChrome = false,
  externalInterceptorPath = false,
  focusFirstClick = false,
  failedCount = 0,
  failureKind = "reporter-contradiction",
  failedRows,
  inputDigest = digest,
  missingBaseEvidence = false,
  missingLatestReporterDelta = false,
  missingAffectedCase = false,
  missingAffectedBaseline = false,
  missingExpectedOutcomeAuthority = false,
  missingFixtureScope = false,
  missingForbidden = false,
  missingPixelControls = false,
  missingPopupFollowUp = false,
  missingReporterOracle = false,
  missingRuntimeModes = false,
  minimalFixtureScope = false,
  popupLifecycle = false,
  popupSamePhaseOracles = true,
  physicalHitPath = false,
  preImplementation = false,
  preImplementationBaseline = false,
  receiptIdOverride,
  redTestEscalation = "unit-red: semantic validator test fails before repair",
  reporterProfile = false,
  reporterProfileToolProof = false,
  selectedTestCommand = `${semanticTestPath}; node --test`,
  supersededBaseEvidence = false,
  unresolvedGateFailure = false,
} = {}) => {
  const host = exactChrome
    ? `pid:4242;started:2026-08-20T09:55:00.000Z;base-url:http://localhost:3000;browser:exact-chrome:140;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 140.0${
        reporterProfile && !reporterProfileToolProof
          ? ";reporter-profile:Chrome Dev Profile with Agentation state"
          : ""
      }`
    : "host:none - deterministic Node workflow";
  let receipt = receiptRow({
    attempt: failedCount + 1,
    host,
    inputDigest,
  });

  if (receiptIdOverride) {
    receipt = receipt.replace(
      /sha256:[a-f0-9]{64} \|$/,
      `${receiptIdOverride} |`
    );
  }
  if (preImplementation) {
    receipt =
      "| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |";
  }

  const escalated = architectureVerdict === "escalate";

  const fixtureScope = missingFixtureScope
    ? ""
    : minimalFixtureScope
      ? "; fixture-scope: minimal first invariant"
      : "; fixture-scope: complete full selected input";

  return `
Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---|---|---|---|---|---|---|---|---|---|---|
| case-complete | ${
    exactChrome
      ? "Blink compositor report"
      : browserCommand
        ? "browser keyboard trigger report"
        : "local workflow report"
  } | ${
    browserCommand ? "type @ in the mounted editor" : "validate one complete plan"
  } | ${
    browserCommand ? "the mounted command opens its input" : "semantic closure is accepted"
  } | ${
    missingExpectedOutcomeAuthority
      ? "pending"
      : "accepted-product-law: Regression semantic closure contract"
  } | ${redTestEscalation} | ${missingRuntimeModes ? `browser: current-source Chromium route${fixtureScope}` :
    exactChrome
      ? `exact-chrome: installed Chrome 140 on the proof host${
          reporterProfile
            ? `; reporter-profile: Chrome Dev Profile with Agentation state${
                reporterProfileToolProof ? "; tool-proof: computer-use" : ""
              }`
            : ""
        }; runtime-modes: compositor interaction active${fixtureScope}`
      : browserCommand
        ? `browser: current-source Chromium route; runtime-modes: mounted command mode active${fixtureScope}`
        : `N/A: deterministic Node workflow; runtime-modes: no optional product mode${fixtureScope}`
  } | ${selectedTestCommand} | ${
    preImplementation ? "reproduced" : "completed"
  } | commit:${"1".repeat(40)} | Regression |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
${reporterEvidenceRows({
  anchorToInapplicableOracle,
  captureRoutingPath,
  externalInterceptorPath,
  failedCount,
  failureKind,
  focusFirstClick,
  physicalHitPath,
  reporterProfile,
  missingBase: missingBaseEvidence,
  missingLatestReporterDelta,
  missingOracle: missingReporterOracle,
  preImplementation,
  supersededBase: supersededBaseEvidence,
})}

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
${oracleRows({
  browserCommand,
  captureRoutingPath,
  exactChrome,
  externalInterceptorPath,
  focusFirstClick,
  physicalHitPath,
  missingForbidden,
  missingPixelControls,
  missingPopupFollowUp,
  popupLifecycle,
  popupSamePhaseOracles,
  reporterProfile,
  reporterProfileToolProof,
})}

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${receipt}

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|---|---|---|---|---|---|---|
${
  preImplementation
    ? preImplementationBaseline
      ? "| Regression validator | case-complete | pass: executable case passed before the shared-owner edit | pending | pending | pending | pending |"
      : "| pending | pending | pending | pending | pending | pending | pending |"
    : `| Regression validator | ${
        missingAffectedCase ? "other-case" : "case-complete"
      } | ${
        missingAffectedBaseline
          ? "N/A: baseline skipped"
          : "pass: semantic contract passed before the owner edit"
      } | ${
        proofTimes.latestInput
      } | node --test semantic contracts | ${inputDigest} | pass: affected corpus replayed after final owner edit |`
}

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|---|---|---|---|---|
${
  preImplementation
    ? "| pending | pending | pending | pending | pending |"
    : unresolvedGateFailure
    ? "| pnpm check:plite | browser selection direction failed | shared selection owner | dismissed as unrelated | N/A: no final rerun |"
    : noGateFailureRow
}

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---|---|---|---|---|---|---|---|---|---|
${
  failedRows ??
  (failedCount
    ? failedFixRows({ count: failedCount, failureKind })
    : noFailedFixRow)
}

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---|---|---|---|---|---|---|
| case-complete | ${failedCount} | ${
    failedCount >= 2 ? "second-failed-fix" : "none: no architecture trigger"
  } | ${architectureVerdict} | ${
    escalated
      ? "required: best-api accepted target"
      : "N/A: local correctness patch"
  } | ${
    escalated
      ? "plate-plan: accepted adoption proof"
      : "N/A: local correctness patch"
  } | pass: architecture decision recorded before implementation |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|---|---|---|---|---|---|
${
  preImplementation
    ? "| pending | pending | pending | pending | pending | pending |"
    : `| case-complete | ${
        failedCount ? "claimed fix failed" : "semantic workflow owner checked"
      } | ${failedCount ? "repair-now" : "no-change"} | ${
        failedCount
          ? ".agents/rules/regression/scripts/validate-regression-plan.mjs"
          : "validator already covers the case"
      } | pass: semantic workflow contract | ${
        failedCount
          ? "failed-fix interrupt completed"
          : "no claimed fix failure"
      } |`
}
`;
};

test(semanticTestTitle, () => {
  assert.deepEqual(
    validateRegressionPlan(fixture(), { complete: true, rootDir: root }),
    []
  );
});

test("selective invalidation cannot close from repeated edits to one target", () => {
  const plan = fixture().replace(
    "validate one complete plan",
    "exercise affected-only publication"
  );

  assert.match(
    validateRegressionPlan(plan, { complete: true, rootDir: root }).join("\n"),
    /selective invalidation requires applicable follow-up-input@follow-up/
  );
});

test("selective invalidation proves unchanged reads and an unrelated-then-affected transition", () => {
  const plan = fixture()
    .replace("validate one complete plan", "exercise selective invalidation")
    .replace(
      /\| case-complete \| follow-up-input \| follow-up \|[^\n]+/,
      `| case-complete | follow-up-input | follow-up | yes | unrelated-then-affected: edit a different target, then this target; unchanged-read: preserve an unedited value | stale positions or altered unchanged values survive | package | test: ${semanticTestPath}#${semanticTestTitle} | pass: transition contract; unrelated-then-affected: pass; unchanged-read: pass |`
    );

  assert.deepEqual(
    validateRegressionPlan(plan, { complete: true, rootDir: root }),
    []
  );

  for (const evidence of ["unrelated-then-affected", "unchanged-read"]) {
    assert.match(
      validateRegressionPlan(plan.replace(`${evidence}: pass`, `${evidence}: pending`), {
        complete: true,
        rootDir: root,
      }).join("\n"),
      new RegExp(`selective invalidation completion requires ${evidence}: pass`)
    );
  }
});

test("runtime identity mapping cannot close from value equality alone", () => {
  const plan = fixture().replace(
    "validate one complete plan",
    "repair runtime identity mapping"
  );

  const errors = validateRegressionPlan(plan, {
    complete: true,
    rootDir: root,
  }).join("\n");

  for (const evidence of ["serialized-replay", "retained-identity", "deleted-identity", "split-merge-range"]) {
    assert.match(errors, new RegExp(`runtime identity requires ${evidence}: assertion`));
  }
});

test("runtime identity mapping proves serialized retained and deleted identities", () => {
  const plan = fixture()
    .replace("validate one complete plan", "repair runtime identity mapping")
    .replace(
      /\| case-complete \| model \| after-action \|[^\n]+/,
      `| case-complete | model | after-action | yes | serialized-replay: round-trip the change; retained-identity: shifted siblings keep their keys; deleted-identity: the removed key resolves to null; split-merge-range: a formatting round-trip preserves selected text and direction across split and merge | a removed key transfers to a surviving sibling or a retained selection moves | package | test: ${semanticTestPath}#${semanticTestTitle} | pass: serialized-replay: pass; retained-identity: pass; deleted-identity: pass; split-merge-range: pass |`
    );

  assert.deepEqual(validateRegressionPlan(plan, { complete: true, rootDir: root }), []);
  for (const evidence of ["serialized-replay", "retained-identity", "deleted-identity", "split-merge-range"]) {
    assert.match(
      validateRegressionPlan(plan.replace(`${evidence}: pass`, `${evidence}: pending`), {
        complete: true,
        rootDir: root,
      }).join("\n"),
      new RegExp(`runtime identity completion requires ${evidence}: pass`)
    );
  }
});

test("pre-implementation validation permits final-proof placeholders", () => {
  assert.deepEqual(
    validateRegressionPlan(fixture({ preImplementation: true }), {
      rootDir: root,
    }),
    []
  );
});

test("focus-first click plans require the complete first gesture", () => {
  const valid = fixture({ focusFirstClick: true });

  assert.deepEqual(
    validateRegressionPlan(valid, { complete: true, rootDir: root }),
    []
  );

  const missingSetupAndOrder = valid
    .replaceAll(
      "initial-focus: editor-text-caret-before-date",
      "editor focus is unspecified"
    )
    .replace(
      "event-order: pointerdown>mousedown>focus>click",
      "click event delivered"
    )
    .replace("first-click-popup: open", "popup eventually opens");
  const setupErrors = validateRegressionPlan(missingSetupAndOrder, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(
    setupErrors,
    /requires initial-focus: <concrete reporter state>/
  );
  assert.match(
    setupErrors,
    /requires event-order with pointerdown, mousedown, and click/
  );
  assert.match(setupErrors, /requires first-click-popup: open/);

  const mismatchedSetup = valid.replace(
    "initial-focus: editor-text-caret-before-date; before pointerdown",
    "initial-focus: outside-editor; before pointerdown"
  );
  const mismatchErrors = validateRegressionPlan(mismatchedSetup, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(mismatchErrors, /initial-focus must match reporter evidence/);

  const alreadyFocusedGesture = valid.replaceAll(
    "pointerdown>mousedown>focus>click",
    "pointerdown>mousedown>click"
  );

  assert.deepEqual(
    validateRegressionPlan(alreadyFocusedGesture, {
      complete: true,
      rootDir: root,
    }),
    []
  );

  const missingCompletionTrace = valid
    .replace("pass: initial-focus: pass", "pass: focus observed")
    .replace("pass: event-order: pass", "pass: click observed")
    .replace("pass: first-click-popup: pass", "pass: popup observed");
  const completionErrors = validateRegressionPlan(missingCompletionTrace, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(completionErrors, /requires initial-focus: pass/);
  assert.match(completionErrors, /requires event-order: pass/);
  assert.match(completionErrors, /requires first-click-popup: pass/);
});

test("reporter-video hit paths reject locator and programmatic-selection proof", () => {
  const valid = fixture({
    failedCount: 1,
    focusFirstClick: true,
    physicalHitPath: true,
  });

  assert.deepEqual(
    validateRegressionPlan(valid, { complete: true, rootDir: root }),
    []
  );

  const proxyOnly = valid
    .replaceAll("physical-hit-target: date-button", "locator click reached Date")
    .replaceAll("selection-origin: physical-pointer", "selection was seeded")
    .replace("; physical-hit-target: pass; click-delivery: pass", "")
    .replace("; selection-origin: pass", "");
  const errors = validateRegressionPlan(proxyOnly, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires physical-hit-target/);
  assert.match(errors, /requires selection-origin: physical-pointer/);
  assert.match(errors, /requires physical-hit-target: pass/);
  assert.match(errors, /requires click-delivery: pass/);
  assert.match(errors, /requires selection-origin: pass/);
});

test("reporter-visible browser profiles reject clean-profile substitution", () => {
  const valid = fixture({
    exactChrome: true,
    focusFirstClick: true,
    reporterProfile: true,
  });

  assert.deepEqual(
    validateRegressionPlan(valid, { complete: true, rootDir: root }),
    []
  );

  const cleanEnvironment = valid.replace(
    "; reporter-profile: Chrome Dev Profile with Agentation state",
    ""
  );
  assert.match(
    validateRegressionPlan(cleanEnvironment, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /requires Exact environment reporter-profile/
  );

  const cleanOracle = valid.replaceAll(
    "exact-chrome reporter-profile browser",
    "exact-chrome browser"
  );
  assert.match(
    validateRegressionPlan(cleanOracle, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /requires reporter-profile proof/
  );

  const missingReplay = valid.replaceAll(
    "; reporter-profile-replay: pass",
    ""
  );
  assert.match(
    validateRegressionPlan(missingReplay, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /requires reporter-profile-replay: pass/
  );

  const cleanReceipt = valid.replace(
    ";reporter-profile:Chrome Dev Profile with Agentation state",
    ""
  );
  assert.match(
    validateRegressionPlan(cleanReceipt, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /requires a profile-bound receipt or explicit tool-proof: computer-use/
  );

  const toolNativeProfileProof = fixture({
    exactChrome: true,
    focusFirstClick: true,
    reporterProfile: true,
    reporterProfileToolProof: true,
  });

  assert.deepEqual(
    validateRegressionPlan(toolNativeProfileProof, {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test("capture routing validates attributes on the actual ancestor owner", () => {
  const valid = fixture({
    captureRoutingPath: true,
    failedCount: 1,
    focusFirstClick: true,
    physicalHitPath: true,
  });

  assert.deepEqual(
    validateRegressionPlan(valid, { complete: true, rootDir: root }),
    []
  );

  const childOnly = valid
    .replaceAll(
      "interaction-owner-chain: date-button -> inline-void -> editable",
      "button has draggable"
    )
    .replaceAll(
      "capture-routing-contract: draggable on inline-void",
      "child draggable asserted"
    )
    .replace("; interaction-owner-chain: pass; capture-routing-contract: pass", "");
  const errors = validateRegressionPlan(childOnly, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires interaction-owner-chain/);
  assert.match(errors, /requires capture-routing-contract/);
  assert.match(errors, /requires interaction-owner-chain: pass/);
  assert.match(errors, /requires capture-routing-contract: pass/);
});

test("live-tab contradictions inventory external capture interceptors", () => {
  const valid = fixture({
    externalInterceptorPath: true,
    failedCount: 1,
    focusFirstClick: true,
    physicalHitPath: true,
  });

  assert.deepEqual(
    validateRegressionPlan(valid, { complete: true, rootDir: root }),
    []
  );

  const missingState = valid.replaceAll(
    "external-interceptor-state: active blockInteractions=true; ",
    ""
  );
  assert.match(
    validateRegressionPlan(missingState, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /requires external-interceptor-state/
  );

  const missingIsolation = valid.replace(
    "; external-interceptor-isolated: pass",
    ""
  );
  assert.match(
    validateRegressionPlan(missingIsolation, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /requires external-interceptor-isolated: pass/
  );
});

test("unit RED requires parity with route-owned runtime modes", () => {
  assert.match(
    validateRegressionPlan(fixture({ missingRuntimeModes: true }), {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /unit RED requires runtime-modes: in Exact environment/
  );
});

test("unit RED requires explicit fixture scope", () => {
  assert.match(
    validateRegressionPlan(fixture({ missingFixtureScope: true }), {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /unit RED requires fixture-scope: complete or minimal in Exact environment/
  );
});

test("minimal fixture scope cannot close the case", () => {
  assert.match(
    validateRegressionPlan(fixture({ minimalFixtureScope: true }), {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /minimal fixture scope cannot support completed, fixed, or kept status/
  );
});

test("the four reporter-invalidated plans fail semantic validation", () => {
  for (const planPath of [
    "docs/plans/5091-fix-stale-font-size-selection-highlight.md",
    "docs/plans/5065-fix-table-tab-navigation.md",
    "docs/plans/5064-fix-homepage-table-grid-enter-crash.md",
    "docs/plans/2026-08-06-complete-remaining-felix-issues.md",
  ]) {
    const errors = validateRegressionPlan(readFileSync(join(root, planPath)), {
      complete: true,
      rootDir: root,
    });

    assert.match(
      errors.join("\n"),
      /missing (?:Selected executable cases|Reporter oracle matrix)/,
      planPath
    );
  }
});

test("positive assertions cannot omit the forbidden end state", () => {
  assert.match(
    validateRegressionPlan(fixture({ missingForbidden: true }), {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /model@after-action requires Forbidden state/
  );
});

test("a negative-only report cannot authorize an invented positive outcome", () => {
  const errors = validateRegressionPlan(
    fixture({ missingExpectedOutcomeAuthority: true }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(errors, /requires Expected-outcome authority/);
});

test("an exact unit RED rejects redundant E2E test escalation", () => {
  const errors = validateRegressionPlan(
    fixture({
      selectedTestCommand:
        "apps/plite/tests/plite-browser/redundant-regression.test.ts; pnpm --filter plite test:plite-browser:chromium",
    }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(errors, /unit RED.*must not add a new E2E test/i);
});

test("a Browser command case requires mounted runtime and mutation ownership proof", () => {
  const incompleteProof = fixture({ browserCommand: true });
  const errors = validateRegressionPlan(incompleteProof, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(
    errors,
    /requires a dom-native Browser oracle with runtime-owner: pass and mutation-owner: pass/
  );

  const mountedOwnerProof = incompleteProof.replace(
    "pass: mounted command dispatched",
    "pass: runtime-owner: pass; mutation-owner: pass; mounted command dispatched"
  );

  assert.doesNotMatch(
    validateRegressionPlan(mountedOwnerProof, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /runtime-owner: pass and mutation-owner: pass/
  );
});

test("a failed Browser command fix cannot resume before mounted mutation proof", () => {
  const failedBrowserFix = fixture({ browserCommand: true, failedCount: 1 });
  const errors = validateRegressionPlan(failedBrowserFix, {
    rootDir: root,
  }).join("\n");

  assert.match(
    errors,
    /failed browser command fix cannot resume.*runtime-owner: pass and mutation-owner: pass/i
  );

  const mountedOwnerProof = failedBrowserFix.replace(
    "pass: mounted command dispatched",
    "pass: runtime-owner: pass; mutation-owner: pass; mounted command remains behavior-red"
  );

  assert.doesNotMatch(
    validateRegressionPlan(mountedOwnerProof, { rootDir: root }).join("\n"),
    /cannot resume.*runtime-owner: pass and mutation-owner: pass/i
  );
});

test("E2E escalation requires a lower-layer reproduction limitation", () => {
  const errors = validateRegressionPlan(
    fixture({
      redTestEscalation: "e2e-required: native selection cannot be RED in unit",
      selectedTestCommand: "tooling/e2e/native-selection.test.ts; pnpm e2e",
    }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.doesNotMatch(errors, /Red-test escalation|must not add a new E2E/i);
});

test("a completed popup lifecycle requires a usable follow-up interaction", () => {
  const errors = validateRegressionPlan(
    fixture({ missingPopupFollowUp: true, popupLifecycle: true }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(
    errors,
    /popup lifecycle requires applicable follow-up-input@follow-up/
  );
  assert.deepEqual(
    validateRegressionPlan(fixture({ popupLifecycle: true }), {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test("a focus transfer covers direct and deferred next-target resolution", () => {
  const focusCase = fixture()
    .replace("validate one complete plan", "move focus to a marked control")
    .replace("semantic closure is accepted", "the marked control owns focus")
    .replace(
      /^\| case-complete \| focus \| after-action \|.*$/m,
      `| case-complete | focus | after-action | yes | the marked control owns focus | inactive paint never activates | browser and DOM focus sequence | test: ${semanticTestPath}#${semanticTestTitle} | pass: marked control focused |`
    );
  const errors = validateRegressionPlan(focusCase, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires focus-transfer: direct-related-target/);
  assert.match(errors, /requires direct-related-target: pass/);
  assert.match(errors, /requires null-related-target: pass/);
  assert.match(errors, /requires focusin-resolution: pass/);

  const resolved = focusCase
    .replace(
      "the marked control owns focus | inactive paint never activates",
      "focus-transfer: direct-related-target + null-related-target -> focusin resolves the marked control | an unmarked target or pending null phase paints"
    )
    .replace(
      "pass: marked control focused",
      "pass: direct-related-target: pass; null-related-target: pass; focusin-resolution: pass"
    );

  assert.deepEqual(
    validateRegressionPlan(resolved, { complete: true, rootDir: root }),
    []
  );
});

test("a keyed subscription fix covers add, update, remove, and teardown", () => {
  const lifecycleCase = fixture().replace(
    "validate one complete plan",
    "remove one member from a subscription-backed keyed collection"
  );
  const missingOracleErrors = validateRegressionPlan(lifecycleCase, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(
    missingOracleErrors,
    /subscription-backed keyed collection requires an applicable subscription-lifecycle oracle/
  );

  const incompleteLifecycle = lifecycleCase.replace(
    /^\| case-complete \| subscription-lifecycle \| after-action \|.*$/m,
    `| case-complete | subscription-lifecycle | after-action | yes | the same keyed publication path releases removed members | a removed member reaches a stale item subscriber | package | test: ${semanticTestPath}#${semanticTestTitle} | pass: update: pass |`
  );
  const incompleteErrors = validateRegressionPlan(incompleteLifecycle, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(incompleteErrors, /requires add: pass/);
  assert.match(incompleteErrors, /requires remove: pass/);
  assert.match(incompleteErrors, /requires teardown: pass/);

  const resolved = incompleteLifecycle.replace(
    "pass: update: pass",
    "pass: add: pass; update: pass; remove: pass; teardown: pass"
  );

  assert.deepEqual(
    validateRegressionPlan(resolved, { complete: true, rootDir: root }),
    []
  );
});

test("a disposable effect source survives StrictMode rehearsal", () => {
  const lifecycleCase = fixture()
    .replace(
      "validate one complete plan",
      "destroy an effect-owned disposable source during React StrictMode"
    )
    .replace(
      /^\| case-complete \| subscription-lifecycle \| after-action \|.*$/m,
      `| case-complete | subscription-lifecycle | after-action | yes | the disposable source publishes after setup | cleanup permanently destroys the remounted source | React package | test: ${semanticTestPath}#${semanticTestTitle} | pass: add: pass; update: pass; remove: pass; teardown: pass |`
    );
  const errors = validateRegressionPlan(lifecycleCase, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires strict-effect: mount \+ cleanup \+ remount/);
  assert.match(errors, /requires mount: pass/);
  assert.match(errors, /requires cleanup: pass/);
  assert.match(errors, /requires remount: pass/);
  assert.match(errors, /requires post-remount-publication: pass/);

  const resolved = lifecycleCase
    .replace(
      "the disposable source publishes after setup",
      "strict-effect: mount + cleanup + remount keeps the disposable source live after the rehearsal"
    )
    .replace(
      "pass: add: pass; update: pass; remove: pass; teardown: pass",
      "pass: add: pass; update: pass; remove: pass; teardown: pass; mount: pass; cleanup: pass; remount: pass; post-remount-publication: pass"
    );

  assert.deepEqual(
    validateRegressionPlan(resolved, { complete: true, rootDir: root }),
    []
  );
});

test("a popup close requires same-phase selection and focus accounting", () => {
  const errors = validateRegressionPlan(
    fixture({ popupLifecycle: true, popupSamePhaseOracles: false }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(
    errors,
    /popup lifecycle at after-action requires dom-native@after-action/
  );
  assert.match(
    errors,
    /popup lifecycle at after-action requires focus@after-action/
  );
});

test("popup focus completion requires settled focus and a follow-up key", () => {
  const immediateFocus = fixture({ popupLifecycle: true }).replace(
    /^\| case-complete \| focus \| after-action \|.*$/m,
    `| case-complete | focus | after-action | yes | the popup input owns focus | the editor root steals focus | Browser mounted focus lifecycle | test: ${semanticTestPath}#${semanticTestTitle} | pass: input focused immediately after open |`
  );
  const errors = validateRegressionPlan(immediateFocus, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /popup focus requires focus-stability: settled \+ follow-up-key/);
  assert.match(errors, /popup focus completion requires settled-focus: pass/);
  assert.match(errors, /popup focus completion requires follow-up-key: pass/);

  const resolved = immediateFocus
    .replace(
      "the popup input owns focus | the editor root steals focus",
      "focus-stability: settled + follow-up-key keeps the popup input focused | the editor root steals focus"
    )
    .replace(
      "pass: input focused immediately after open",
      "pass: settled-focus: pass; follow-up-key: pass"
    );
  const resolvedErrors = validateRegressionPlan(resolved, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.doesNotMatch(resolvedErrors, /popup focus/);
});

test("shortcut-opened popup focus requires a native keyboard trigger", () => {
  const shortcutFocus = fixture({
    browserCommand: true,
    popupLifecycle: true,
  })
    .replace(
      "type @ in the mounted editor",
      "press the Meta+K shortcut in the focused editor"
    )
    .replace(
      /^\| case-complete \| focus \| after-action \|.*$/m,
      `| case-complete | focus | after-action | yes | focus-stability: settled + follow-up-key keeps the popup input focused | the editor root steals focus | Browser mounted focus lifecycle | test: ${semanticTestPath}#${semanticTestTitle} | pass: settled-focus: pass; follow-up-key: pass |`
    );
  const errors = validateRegressionPlan(shortcutFocus, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(
    errors,
    /requires trigger-path: pre-focused-surface \+ native-keyboard/
  );
  assert.match(errors, /requires native-trigger-key: pass/);

  const resolved = shortcutFocus
    .replace(
      "focus-stability: settled + follow-up-key keeps the popup input focused",
      "focus-stability: settled + follow-up-key; trigger-path: pre-focused-surface + native-keyboard keeps the popup input focused"
    )
    .replace(
      "pass: settled-focus: pass; follow-up-key: pass",
      "pass: settled-focus: pass; follow-up-key: pass; native-trigger-key: pass"
    );
  const resolvedErrors = validateRegressionPlan(resolved, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.doesNotMatch(resolvedErrors, /native keyboard trigger/);
});

test("a caret-visible report requires native, focus, and follow-up oracles", () => {
  const caretClaim =
    "selecting a block void leaves a caret-accessible blank line";
  const invalid = fixture().replace(
    "semantic closure matches the cumulative report",
    caretClaim
  );
  const errors = validateRegressionPlan(invalid, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(
    errors,
    /caret-visible behavior requires oracle anchor dom-native@after-action/
  );
  assert.match(
    errors,
    /caret-visible behavior requires oracle anchor focus@after-action/
  );
  assert.match(
    errors,
    /caret-visible behavior requires oracle anchor follow-up-input@follow-up/
  );

  const resolved = invalid
    .replace(
      `| ${caretClaim} | required | model@after-action |`,
      `| ${caretClaim} | required | dom-native@after-action, focus@after-action, follow-up-input@follow-up |`
    )
    .replace(
      /^\| case-complete \| dom-native \| after-action \|.*$/m,
      `| case-complete | dom-native | after-action | yes | native selection stays on the selected void without a separate caret row | a caret paints below the void | browser | test: ${semanticTestPath}#${semanticTestTitle} | pass: native caret excluded |`
    )
    .replace(
      /^\| case-complete \| focus \| after-action \|.*$/m,
      `| case-complete | focus | after-action | yes | the editor retains focus while the void remains selected | focus moves into a phantom blank line | browser | test: ${semanticTestPath}#${semanticTestTitle} | pass: focus retained |`
    )
    .replace(
      /^\| case-complete \| follow-up-input \| follow-up \|.*$/m,
      `| case-complete | follow-up-input | follow-up | yes | the next editor input edits a real neighboring block | the hidden caret repair breaks the next input | browser | test: ${semanticTestPath}#${semanticTestTitle} | pass: follow-up input works |`
    );

  assert.deepEqual(
    validateRegressionPlan(resolved, { complete: true, rootDir: root }),
    []
  );
});

test("a positive layout reference requires executable reference geometry", () => {
  const evidence = `| case-complete | positive-authority | correct layout screenshot | during-action | content keeps full-row centered layout without compression | required | geometry-paint@during-action | test: ${semanticTestPath}#${semanticTestTitle} | pass: reference retained |`;
  const invalid = fixture({ exactChrome: true }).replace(
    /(?=\n\nReporter oracle matrix:)/,
    `\n${evidence}`
  );
  const errors = validateRegressionPlan(invalid, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires reference-geometry/);
  assert.match(errors, /requires browser layout-bounds proof/);
  assert.match(errors, /requires layout-bounds: pass/);

  const resolved = invalid
    .replace(
      "paint matches final geometry",
      "reference-geometry: content spans its full row and stays centered"
    )
    .replace(
      "exact-chrome pixel classifier",
      "exact-chrome browser pixel classifier with executable layout-bounds"
    )
    .replace(
      "duplicate-control: pass known duplicate-layer state rejected",
      "duplicate-control: pass known duplicate-layer state rejected; layout-bounds: pass"
    );

  assert.deepEqual(
    validateRegressionPlan(resolved, { complete: true, rootDir: root }),
    []
  );
});

test("a failed fix cannot drop the base acceptance when adding the latest reporter delta", () => {
  const errors = validateRegressionPlan(
    fixture({ failedCount: 1, missingBaseEvidence: true }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(
    errors,
    /failed fix requires base-acceptance evidence marked required or superseded/
  );
});

test("superseded base acceptance remains inventoried without executable proof", () => {
  assert.deepEqual(
    validateRegressionPlan(
      fixture({ failedCount: 1, supersededBaseEvidence: true }),
      { complete: true, rootDir: root }
    ),
    []
  );
});

test("only applicable phase-specific oracles satisfy reporter evidence", () => {
  const errors = validateRegressionPlan(
    fixture({ anchorToInapplicableOracle: true }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(errors, /requires applicable oracle focus@after-action/);
});

test("every cumulative reporter claim must map to an existing phase-specific oracle", () => {
  const errors = validateRegressionPlan(
    fixture({ missingReporterOracle: true }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(errors, /requires missing oracle focus@during-action/);
});

test("only reporter contradictions require a latest reporter delta", () => {
  const reporterErrors = validateRegressionPlan(
    fixture({ failedCount: 1, missingLatestReporterDelta: true }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(
    reporterErrors,
    /reporter contradiction requires required latest-reporter-delta evidence/
  );

  for (const failureKind of ["exact-replay", "final-verification"]) {
    assert.deepEqual(
      validateRegressionPlan(fixture({ failedCount: 1, failureKind }), {
        complete: true,
        rootDir: root,
      }),
      [],
      failureKind
    );
  }
});

test("replay and final-verification failures require an unchanged-bytes diagnostic", () => {
  for (const failureKind of ["exact-replay", "final-verification"]) {
    const invalidRows = failedFixRows({ failureKind }).replace(
      "; diagnostic: pass unchanged-bytes failing phase classified",
      ""
    );
    const errors = validateRegressionPlan(
      fixture({ failedCount: 1, failedRows: invalidRows, failureKind }),
      { complete: true, rootDir: root }
    ).join("\n");

    assert.match(
      errors,
      /requires diagnostic: <unchanged-bytes phase\/result>/,
      failureKind
    );
  }
});

test("a failed popup focus fix requires a native focus-owner trace", () => {
  const failedFocus = fixture({
    failedCount: 1,
    failureKind: "exact-replay",
    popupLifecycle: true,
  }).replace(
    /^\| case-complete \| focus \| after-action \|.*$/m,
    `| case-complete | focus | after-action | yes | focus-stability: settled + follow-up-key keeps the popup input focused | the editor root steals focus | Browser mounted focus lifecycle | test: ${semanticTestPath}#${semanticTestTitle} | pass: settled-focus: pass; follow-up-key: pass |`
  );
  const errors = validateRegressionPlan(failedFocus, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires focus-owner-trace: mount \+ positioned \+ settled \+ follow-up-key/);
  assert.match(errors, /requires native-focus-events: focusin \+ focusout capture/);
  assert.match(errors, /requires first-divergence: <phase\/owner>/);
  assert.match(errors, /requires focus-call-trace: target \+ connected \+ display \+ visibility \+ disabled \+ active-after-call/);
  assert.match(errors, /requires focus-call-result: <called-or-not-called\/owner>/);

  const resolved = failedFocus.replace(
    "; diagnostic: pass unchanged-bytes failing phase classified",
    "; diagnostic: pass unchanged-bytes failing phase classified; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: positioned/input-not-focused; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: not-called/url-input"
  );
  const resolvedErrors = validateRegressionPlan(resolved, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.doesNotMatch(resolvedErrors, /failed popup focus fix/);
});

test("a failed scheduled popup focus fix requires a scheduler trace", () => {
  const failedFocus = fixture({
    failedCount: 1,
    failureKind: "exact-replay",
    popupLifecycle: true,
  })
    .replace(
      "reporter contradiction after claimed candidate",
      "requestAnimationFrame popup focus candidate failed exact replay"
    )
    .replace(
      /^\| case-complete \| focus \| after-action \|.*$/m,
      `| case-complete | focus | after-action | yes | focus-stability: settled + follow-up-key keeps the popup input focused | the editor root steals focus | Browser mounted focus lifecycle | test: ${semanticTestPath}#${semanticTestTitle} | pass: settled-focus: pass; follow-up-key: pass |`
    )
    .replace(
      "; diagnostic: pass unchanged-bytes failing phase classified",
      "; diagnostic: pass unchanged-bytes failing phase classified; focus-owner-trace: mount + positioned + settled + follow-up-key; native-focus-events: focusin + focusout capture; first-divergence: positioned/input-not-focused; focus-call-trace: target + connected + display + visibility + disabled + active-after-call; focus-call-result: called/url-input-hidden"
    );
  const errors = validateRegressionPlan(failedFocus, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(
    errors,
    /requires focus-scheduler-trace: request \+ cancel \+ run/
  );
  assert.match(
    errors,
    /requires focus-scheduler-result: <ran-or-cancelled\/target-readiness>/
  );

  const resolved = failedFocus.replace(
    "focus-call-result: called/url-input-hidden",
    "focus-call-result: called/url-input-hidden; focus-scheduler-trace: request + cancel + run; focus-scheduler-result: ran/not-cancelled/url-input-hidden"
  );
  const resolvedErrors = validateRegressionPlan(resolved, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.doesNotMatch(resolvedErrors, /focus-scheduler/);

  for (const scheduler of ["setTimeout", "timer"]) {
    const timerErrors = validateRegressionPlan(
      failedFocus.replace("requestAnimationFrame", scheduler),
      { complete: true, rootDir: root }
    ).join("\n");

    assert.match(timerErrors, /requires focus-scheduler-trace/);
    assert.match(timerErrors, /requires focus-scheduler-result/);
  }
});

test("pointer-driven cases require an applicable pointer-feedback oracle", () => {
  const pointerCase = fixture()
    .replace(
      "validate one complete plan",
      "drag pointer over an ignored resize handle"
    )
    .replace(
      "semantic closure is accepted",
      "the cursor stays text while resize remains ignored"
    );
  const errors = validateRegressionPlan(pointerCase, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires an applicable pointer-feedback oracle/);
});

test("pointer-feedback completion requires an interaction trace", () => {
  const pointerCase = fixture()
    .replace(
      "validate one complete plan",
      "drag pointer over an ignored resize handle"
    )
    .replace(
      "semantic closure is accepted",
      "the cursor stays text while resize remains ignored"
    )
    .replace(
      "| case-complete | pointer-feedback | during-action | no | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case |",
      `| case-complete | pointer-feedback | during-action | yes | held pointer keeps the text cursor | resize cursor appears | browser pointer event oracle | test: ${semanticTestPath}#${semanticTestTitle} | pass: computed cursor is text |`
    );
  const errors = validateRegressionPlan(pointerCase, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires interaction-trace: pass/);
});

test("continuous pointer boundary exits require liveness and release proof", () => {
  const boundaryCase = fixture()
    .replace(
      "validate one complete plan",
      "keep a held mouse drag scrolling after it leaves the editor or browser window"
    )
    .replace(
      "semantic closure is accepted",
      "autoscroll continues outside the editor until release"
    )
    .replace(
      "| case-complete | pointer-feedback | during-action | no | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case |",
      `| case-complete | pointer-feedback | during-action | yes | reporter-noun: selection drag; affordance-inventory: editor scrollport; held pointer keeps scrolling outside | scrolling stalls after boundary exit | browser pointer event oracle | test: ${semanticTestPath}#${semanticTestTitle} | pass: interaction-trace: pass; target: editor; event: mousemove; buttons: 1 |`
    );
  const errors = validateRegressionPlan(boundaryCase, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires boundary-liveness:/);
  assert.match(errors, /requires release-cleanup:/);
  assert.match(errors, /requires scroll-owner:/);
  assert.match(errors, /requires speed-law:/);
  assert.match(errors, /requires visible-scroll:/);
  assert.match(errors, /requires a boundary-exit proof layer/);
  assert.match(errors, /requires boundary-exit-trace: pass/);
  assert.match(errors, /requires range-miss: continue/);
  assert.match(errors, /requires owner-lock: pass/);
  assert.match(errors, /requires speed-consistency: pass/);
  assert.match(errors, /requires visible-scroll: pass/);
  assert.match(errors, /requires release: stop/);

  const resolved = boundaryCase
    .replace(
      "reporter-noun: selection drag; affordance-inventory: editor scrollport; held pointer keeps scrolling outside",
      "reporter-noun: selection drag; affordance-inventory: editor scrollport; boundary-liveness: last valid boundary coordinate survives transient range misses; release-cleanup: mouseup pointerup dragend and blur stop; scroll-owner: originating editor scrollport stays fixed; speed-law: outside region keeps one signed delta; visible-scroll: actual owner offset and stable content geometry move without programmatic scroll; held pointer keeps scrolling outside"
    )
    .replace("browser pointer event oracle", "browser boundary-exit pointer event oracle")
    .replace(
      "buttons: 1 |",
      "buttons: 1; boundary-exit-trace: pass; range-miss: continue; owner-lock: pass; speed-consistency: pass; visible-scroll: pass; release: stop |"
    );

  assert.deepEqual(
    validateRegressionPlan(resolved, { complete: true, rootDir: root }),
    []
  );
});

test("the latest reporter-invalidated outside-scroll packet lacks visible movement proof", () => {
  const planPath =
    "docs/plans/2026-08-27-outside-editor-autoscroll-owner-speed-failed-fix-repair.md";
  const errors = validateRegressionPlan(readFileSync(join(root, planPath)), {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires visible-scroll:/);
  assert.match(errors, /requires visible-scroll: pass/);
});

test("no-flash pointer feedback requires pre-handler state", () => {
  const pointerCase = fixture()
    .replace(
      "validate one complete plan",
      "drag pointer over an ignored resize handle without a one-frame cursor flash"
    )
    .replace(
      "semantic closure is accepted",
      "the cursor is text before the resize handle processes pointer movement"
    )
    .replace(
      "| case-complete | pointer-feedback | during-action | no | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case |",
      `| case-complete | pointer-feedback | during-action | yes | reporter-noun: resize handle; affordance-inventory: column-end; held pointer keeps the text cursor without a frame flash | resize cursor appears before the handle processes pointer movement | browser target-capture oracle | test: ${semanticTestPath}#${semanticTestTitle} | pass: interaction-trace: pass; target: resize-handle; event: pointermove; buttons: 1; computed cursor is text |`
    );
  const errors = validateRegressionPlan(pointerCase, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires pre-handler-state: pass/);

  const resolvedErrors = validateRegressionPlan(
    pointerCase.replace(
      "computed cursor is text",
      "pre-handler-state: pass; computed cursor is text"
    ),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.doesNotMatch(resolvedErrors, /pre-handler-state|proof layer/);
});

test("pointer-feedback cannot narrow a reporter UI noun to one affordance", () => {
  const missingInventory = fixture()
    .replace(
      "validate one complete plan",
      "drag pointer over a visible drag handle"
    )
    .replace(
      "semantic closure is accepted",
      "every matching drag affordance stays hidden"
    )
    .replace(
      "| case-complete | pointer-feedback | during-action | no | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case |",
      `| case-complete | pointer-feedback | during-action | yes | matching controls stay hidden | a selected-cell drag control remains visible | browser pointer event oracle | test: ${semanticTestPath}#${semanticTestTitle} | pass: interaction-trace: pass; target: table-cell; event: pointermove; buttons: 1 |`
    );
  const missingErrors = validateRegressionPlan(missingInventory, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(missingErrors, /requires reporter-noun: <plain UI noun>/);
  assert.match(missingErrors, /requires affordance-inventory:/);

  const inventoried = missingInventory.replace(
    "matching controls stay hidden",
    "reporter-noun: drag handle; affordance-inventory: Drag block, Move selected cells, Select or move row; matching controls stay hidden"
  );
  const inventoriedErrors = validateRegressionPlan(inventoried, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.doesNotMatch(inventoriedErrors, /requires reporter-noun:/);
  assert.doesNotMatch(inventoriedErrors, /requires affordance-inventory:/);
});

test("a failed claimed fix requires invalidation and automatic workflow repair", () => {
  const invalid = fixture({
    failedCount: 1,
    failedRows: failedFixRows({ invalidate: false, repair: false }),
  });
  const errors = validateRegressionPlan(invalid, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /must invalidate the prior claim/);
  assert.match(errors, /requires repair-now in a Regression source owner/);

  assert.deepEqual(
    validateRegressionPlan(fixture({ failedCount: 1 }), {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test("a second failed fix requires Best API and a layer plan", () => {
  const errors = validateRegressionPlan(fixture({ failedCount: 2 }), {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires architecture verdict escalate/);
  assert.match(errors, /requires Best API/);
  assert.match(errors, /requires a Plite or Plate layer plan/);

  assert.deepEqual(
    validateRegressionPlan(
      fixture({ architectureVerdict: "escalate", failedCount: 2 }),
      { complete: true, rootDir: root }
    ),
    []
  );
});

test("browser-specific paint claims require exact Chrome proof", () => {
  const chromiumOnly = fixture({ exactChrome: true })
    .replace(
      "exact-chrome: installed Chrome 140 on the proof host",
      "browser: Playwright Chromium"
    )
    .replace("browser:exact-chrome:140", "browser:chromium:140");
  const errors = validateRegressionPlan(chromiumOnly, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires Exact environment exact-chrome/);
  assert.match(
    errors,
    /requires an executable-attested exact Chrome proof receipt/
  );

  const handwrittenLabel = fixture({ exactChrome: true }).replace(
    ";browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 140.0",
    ""
  );

  assert.match(
    validateRegressionPlan(handwrittenLabel, {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /requires an executable-attested exact Chrome proof receipt/
  );

  assert.deepEqual(
    validateRegressionPlan(fixture({ exactChrome: true }), {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test("phase-qualified paint oracles trigger exact Chrome without source keywords", () => {
  const oracleOnly = fixture({ exactChrome: true })
    .replace("Blink compositor report", "local workflow report")
    .replace(
      "exact-chrome: installed Chrome 140 on the proof host",
      "browser: generic browser proof"
    )
    .replace("browser:exact-chrome:140", "browser:chromium:140");
  const errors = validateRegressionPlan(oracleOnly, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires Exact environment exact-chrome/);
  assert.match(
    errors,
    /requires an executable-attested exact Chrome proof receipt/
  );
});

test("pixel classifiers cannot complete without single-layer, absent, and duplicate controls", () => {
  const errors = validateRegressionPlan(
    fixture({ exactChrome: true, missingPixelControls: true }),
    { complete: true, rootDir: root }
  ).join("\n");

  assert.match(
    errors,
    /pixel classifier requires positive-control: pass, negative-control: pass, and duplicate-control: pass evidence/
  );

  assert.deepEqual(
    validateRegressionPlan(fixture({ exactChrome: true }), {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test("geometry-paint completion rejects computed-style-only evidence", () => {
  const computedStyleOnly = fixture({ exactChrome: true })
    .replace("exact-chrome pixel classifier", "exact-chrome computed style")
    .replace(
      "pass: exact Chrome pixel oracle; positive-control: pass known single-layer state; negative-control: pass known-absent state; duplicate-control: pass known duplicate-layer state rejected",
      "pass: computed selection background is transparent"
    );
  const errors = validateRegressionPlan(computedStyleOnly, {
    complete: true,
    rootDir: root,
  }).join("\n");

  assert.match(errors, /requires actual pixel capture\/classification/);
  assert.match(errors, /requires positive-control: pass/);
  assert.match(errors, /requires negative-control: pass/);
});

test("completion requires affected-corpus replay after the last owner edit", () => {
  assert.match(
    validateRegressionPlan(fixture({ missingAffectedCase: true }), {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /case-complete is missing from Affected corpus replay/
  );
});

test("shared-owner work requires an executable pre-edit affected baseline", () => {
  assert.match(
    validateRegressionPlan(fixture({ missingAffectedBaseline: true }), {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /affected corpus Regression validator requires Pre-edit baseline pass: or red:/
  );
});

test("pre-implementation plans may record a baseline before final replay exists", () => {
  assert.deepEqual(
    validateRegressionPlan(
      fixture({ preImplementation: true, preImplementationBaseline: true }),
      {
        complete: false,
        rootDir: root,
      }
    ),
    []
  );
});

test("a started CI gate cannot be dismissed without a passing final rerun", () => {
  assert.match(
    validateRegressionPlan(fixture({ unresolvedGateFailure: true }), {
      complete: true,
      rootDir: root,
    }).join("\n"),
    /gate failure pnpm check:plite requires Final rerun pass/
  );
});

test("proof receipts are tamper-evident", () => {
  assert.match(
    validateRegressionPlan(
      fixture({ receiptIdOverride: `sha256:${"b".repeat(64)}` }),
      { complete: true, rootDir: root }
    ).join("\n"),
    /has an invalid Receipt ID/
  );
});

test("completion recomputes the receipt digest from its exact input paths", () => {
  assert.match(
    validateRegressionPlan(
      fixture({ inputDigest: `sha256:${"b".repeat(64)}` }),
      { complete: true, rootDir: root }
    ).join("\n"),
    /Input digest does not match current bytes/
  );
});

test("managed browser receipts bind the command to the recorded base URL", () => {
  const mismatched = fixture({ exactChrome: true }).replace(
    "PLAYWRIGHT_BASE_URL=http://localhost:3000 ",
    ""
  );

  assert.match(
    validateRegressionPlan(mismatched, { complete: true, rootDir: root }).join(
      "\n"
    ),
    /managed browser command must reference its exact base URL http:\/\/localhost:3000/
  );
});

test("capture helper executes proof and prints a valid receipt row", () => {
  const script = join(
    root,
    ".agents/rules/regression/scripts/capture-proof-receipt.mjs"
  );
  const result = spawnSync(
    process.execPath,
    [
      script,
      "--case-id",
      "capture-case",
      "--attempt",
      "1",
      "--claim",
      "completed",
      "--input",
      semanticTestPath,
      "--host",
      "none: deterministic Node workflow",
      "--retries",
      "0",
      "--",
      process.execPath,
      "-e",
      "process.exit(0)",
    ],
    { cwd: root, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /^\| capture-case \| 1 \| completed \| .+ \| pass: exit 0 in \d+ms \| (?:commit|dirty):[a-f0-9]{40} \| sha256:[a-f0-9]{64} \| 1 \| \.agents\/rules\/regression\/scripts\/validate-regression-plan\.test\.mjs \| host:none - deterministic Node workflow \| .+ \| 0 \| sha256:[a-f0-9]{64} \|$/m
  );
});

test("capture helper rejects a managed host command with a different base URL", () => {
  const script = join(
    root,
    ".agents/rules/regression/scripts/capture-proof-receipt.mjs"
  );
  const result = spawnSync(
    process.execPath,
    [
      script,
      "--case-id",
      "capture-case",
      "--attempt",
      "1",
      "--claim",
      "completed",
      "--input",
      semanticTestPath,
      "--host-pid",
      String(process.pid),
      "--base-url",
      "http://localhost:3999",
      "--browser",
      "playwright-chromium",
      "--retries",
      "0",
      "--",
      process.execPath,
      "-e",
      "process.exit(0)",
    ],
    { cwd: root, encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /managed browser proof command must reference the exact --base-url/
  );
  assert.doesNotMatch(result.stdout, /^\| capture-case/m);
});

test("capture and validation share canonical mixed-path input ordering", () => {
  const script = join(
    root,
    ".agents/rules/regression/scripts/capture-proof-receipt.mjs"
  );
  const mixedInputs = [
    "AGENTS.md",
    ".agents/rules/regression/scripts/validate-regression-plan.mjs",
    semanticTestPath,
  ];
  const result = spawnSync(
    process.execPath,
    [
      script,
      "--case-id",
      "case-complete",
      "--attempt",
      "1",
      "--claim",
      "completed",
      ...mixedInputs.flatMap((input) => ["--input", input]),
      "--host",
      "none: deterministic Node workflow",
      "--retries",
      "0",
      "--",
      process.execPath,
      "-e",
      "process.exit(0)",
    ],
    { cwd: root, encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr);

  const receipt = result.stdout.trim();
  const inputDigest = receipt.match(/ \| (sha256:[a-f0-9]{64}) \| 3 \|/)?.[1];

  assert.ok(inputDigest, receipt);
  assert.deepEqual(
    validateRegressionPlan(
      fixture({ inputDigest }).replace(receiptRow({ inputDigest }), receipt),
      { complete: true, rootDir: root }
    ),
    []
  );
});

test("capture helper emits no receipt for a failed proof command", () => {
  const script = join(
    root,
    ".agents/rules/regression/scripts/capture-proof-receipt.mjs"
  );
  const result = spawnSync(
    process.execPath,
    [
      script,
      "--case-id",
      "capture-case",
      "--attempt",
      "1",
      "--claim",
      "completed",
      "--input",
      semanticTestPath,
      "--host",
      "none: deterministic Node workflow",
      "--retries",
      "0",
      "--",
      process.execPath,
      "-e",
      "process.exit(2)",
    ],
    { cwd: root, encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /proof command failed with exit 2/);
  assert.doesNotMatch(result.stdout, /^\| capture-case/m);
});

test("capture helper emits no receipt when a proof input changes", () => {
  const script = join(
    root,
    ".agents/rules/regression/scripts/capture-proof-receipt.mjs"
  );
  const tmpRoot = join(root, "tmp");
  mkdirSync(tmpRoot, { recursive: true });
  const tmpDir = mkdtempSync(join(tmpRoot, "regression-proof-"));
  const inputPath = join(tmpDir, "input.txt");
  writeFileSync(inputPath, "before");

  try {
    const result = spawnSync(
      process.execPath,
      [
        script,
        "--case-id",
        "capture-case",
        "--attempt",
        "1",
        "--claim",
        "completed",
        "--input",
        relative(root, inputPath),
        "--host",
        "none: deterministic Node workflow",
        "--retries",
        "0",
        "--",
        process.execPath,
        "-e",
        `require('node:fs').appendFileSync(${JSON.stringify(
          inputPath
        )}, 'after')`,
      ],
      { cwd: root, encoding: "utf8" }
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /proof inputs changed while the command ran/);
    assert.doesNotMatch(result.stdout, /^\| capture-case/m);
  } finally {
    rmSync(tmpDir, { force: true, recursive: true });
  }
});
