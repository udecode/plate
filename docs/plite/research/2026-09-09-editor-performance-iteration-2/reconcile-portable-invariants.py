import datetime
import fnmatch
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[4]
artifact = root / 'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
result = {'capturedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'scope': 'All current declared test call sites and all 58 previously extracted portable or feature-policy invariant families from the exact clean reference pins. Source test declarations are not expanded runtime case counts.', 'families': [], 'repositories': []}

def expand_braces(pattern):
    match = re.search(r'\{([^{}]+)\}', pattern)
    if not match:
        return [pattern]
    return [value for part in match.group(1).split(',') for value in expand_braces(pattern[:match.start()] + part + pattern[match.end():])]

for name in ['wordgard', 'prosekit']:
    inventory = json.loads((artifact / f'{name}-full-test-inventory.json').read_text())
    report_path = f'docs/editor-test-harvester/{name}/report.md'
    lines = (root / report_path).read_text().splitlines()
    families = []
    for number, line in enumerate(lines, 1):
        cells = [cell.strip() for cell in line.split('|')]
        if name == 'wordgard':
            if len(cells) < 8 or not re.fullmatch(r'W\d{2}', cells[1]):
                continue
            family_id, donor, topic, invariant, historical_local, historical_status = cells[1:7]
        else:
            if not (130 < number < 152 and len(cells) >= 8 and cells[1].startswith('`packages/') or 130 < number < 152 and len(cells) >= 8 and cells[1].startswith('`registry/')):
                continue
            family_id = f'PK{len(families) + 1:02}'
            donor, _, topic, invariant, historical_local, historical_status = cells[1:7]
        if any(row['id'] == family_id for row in families):
            continue
        patterns = []
        for literal in re.findall(r'`([^`]+)`', donor):
            for value in expand_braces(literal):
                value = re.sub(r':.*$', '', value)
                if name == 'wordgard' and not value.startswith('test/'):
                    value = f'test/{value}'
                patterns.append(value)
        donor_files = [record['file'] for record in inventory['records'] if any(fnmatch.fnmatch(record['file'], pattern) for pattern in patterns)]
        current_files, stale_files = [], []
        for source in re.findall(r'(?:packages|apps|tooling)/[A-Za-z0-9_./{}*,@-]+', historical_local):
            source = source.rstrip('.')
            if '{' in source or '*' in source:
                continue
            (current_files if (root / source).is_file() else stale_files).append(source)
        disposition = 'keep-local'
        reason = 'Preserve the behavioral law. The named current files are source-level guard candidates; this iteration does not borrow a previous runtime pass.'
        if not current_files:
            disposition = 'defer'
            reason = 'The donor behavior is retained as a proof requirement; historical owner citations do not establish an exact current local replay.'
        if name == 'wordgard' and family_id in ['W17', 'W40']:
            disposition = 'reject'
            reason = 'The reference central-authority OT protocol is a different product and synchronization architecture from the local Yjs owner.' if family_id == 'W17' else 'The reference nested multi-block list-item representation is a different document policy from Plate flat list properties.'
        if name == 'wordgard' and family_id == 'W34':
            disposition = 'keep-local'
            reason = 'Keep endpoint association and mapped range laws through canonical structural Anchors; reject adding a second packed linear range API.'
        if name == 'wordgard' and family_id in ['W19', 'W26']:
            disposition = 'defer'
            reason = 'Preserve grapheme, word and visual bidi laws; an exact current native visual movement replay is still required.' if family_id == 'W19' else 'Preserve every composition shape. Browser/synthetic composition proof does not establish raw operating-system IME or mobile device behavior.'
        if name == 'prosekit' and family_id == 'PK05':
            disposition = 'defer'
            reason = 'Plite intentionally paints inactive selection for marked controls, while ProseKit paints on general blur. Preserve the local focus policy and separately replay primary-pointer clearing before nested mousedown, secondary-button retention and stale-view cleanup.'
            current_files = ['packages/plitejs/src/react/internal/inactive-selection.ts', 'apps/www/src/registry/examples/inactive-selection-demo.spec.tsx']
        row = {'id': family_id, 'repository': name, 'sourceReport': f'{report_path}:{number}', 'source': donor, 'donorFiles': donor_files, 'topic': topic, 'invariant': invariant, 'historicalStatus': historical_status, 'currentSourceCandidates': list(dict.fromkeys(current_files)), 'historicalUnresolvedPaths': list(dict.fromkeys(stale_files)), 'proofAdaptation': disposition, 'reason': reason, 'runtimeStatus': 'No fresh upstream runtime pass claimed. Local source/test files require exact replay for current correctness or latency claims.'}
        families.append(row)
    expected = 41 if name == 'wordgard' else 17
    if len(families) != expected:
        raise RuntimeError(f'{name}: {len(families)} families, expected {expected}')
    sites = []
    for record in inventory['records']:
        mapped = [family['id'] for family in families if record['file'] in family['donorFiles']]
        for test in record['tests']:
            category = record['category']
            disposition = 'family-associated; exact local replay remains governed by the referenced family' if mapped else 'Plate feature/UI policy; retain the declared source assertion as a feature-owner proof obligation' if category == 'plate-owned' else 'Reference application-shell or harness-specific assertion; excluded from transferable editor-kernel proof' if category in ['skip', 'product-shell', 'harness'] else 'Portable assertion retained; exact concept-to-test matching remains a proof gap'
            sites.append({'id': f"{name}:{record['file']}:{test['line']}", 'file': record['file'], 'line': test['line'], 'testExpression': test['expression'], 'dynamicDeclaration': test['dynamic'], 'category': category, 'familyIds': mapped, 'disposition': disposition, 'runtime': 'not executed in this iteration'})
    if len(sites) != inventory['testCallSites']:
        raise RuntimeError(f'{name}: missing test call sites')
    result['families'].extend(families)
    result['repositories'].append({'name': name, 'head': inventory['head'], 'sourceFingerprint': inventory['sourceFingerprint'], 'license': 'MIT; behavioral summaries only in this reconciliation', 'files': inventory['fileCount'], 'declaredSites': len(sites), 'unclassifiedFiles': inventory['unknownCount'], 'familyAssociatedSites': sum(bool(site['familyIds']) for site in sites), 'explicitUnmatchedPortableSites': [site['id'] for site in sites if 'exact concept-to-test' in site['disposition']], 'sites': sites})

result['summary'] = {'families': len(result['families']), 'declaredSites': sum(repo['declaredSites'] for repo in result['repositories']), 'proofAdaptations': {value: [family['id'] for family in result['families'] if family['proofAdaptation'] == value] for value in ['keep-local', 'reject', 'defer']}}
(artifact / 'portable-invariant-reconciliation.json').write_text(json.dumps(result, indent=2) + '\n')
markdown = ['# Portable invariant reconciliation', '', result['scope'], '', 'All test call sites have a disposition in the JSON companion. Family association is not an assertion that every line in a file proves the whole family. Unmatched portable assertions remain explicit proof gaps; source inventory never becomes runtime evidence.', '', '| Family | Reference | Invariant | Proof disposition | Reason |', '| --- | --- | --- | --- | --- |']
for row in result['families']:
    markdown.append(f"| {row['id']} | `{row['sourceReport']}` | {row['invariant']} | {row['proofAdaptation']} | {row['reason']} |")
(artifact / 'portable-invariant-reconciliation.md').write_text('\n'.join(markdown) + '\n')
print(json.dumps(result['summary']))
