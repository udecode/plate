import csv
import datetime
import hashlib
import json
import pathlib


root = pathlib.Path.cwd()
stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
artifact = root / 'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'


def cell(value):
    text = str(value or '').replace('\t', ' ').replace('\r', ' ').replace('\n', ' ')
    return "'" + text if text.startswith(('=', '+', '-', '@')) else text


for repo in ['wordgard', 'prosekit']:
    raw_path = root / f'.tmp/{repo}-perf-iteration-2-issues-raw.json'
    raw = json.loads(raw_path.read_text())
    pages = raw['pages'] if repo == 'wordgard' else len(raw)
    records = raw['rows'] if repo == 'wordgard' else [row for page in raw for row in page]
    issues = [row for row in records if not row.get('pull_request')]
    if len({row['number'] for row in issues}) != len(issues):
        raise ValueError(f'{repo}: duplicate provider issue number')
    output = root / f'docs/editor-issue-harvester/{repo}/full'
    output.mkdir(parents=True, exist_ok=True)
    ledger = output / 'issue-closure-ledger.tsv'
    if ledger.exists():
        with ledger.open() as handle:
            reader = csv.DictReader(handle, delimiter='\t')
            fields = list(reader.fieldnames)
            previous = {int(row['issue']): row for row in reader}
        (artifact / f'{repo}-issue-ledger-before-refresh.tsv').write_bytes(ledger.read_bytes())
    else:
        fields = ['check', 'issue', 'state', 'relevant', 'classification', 'owner', 'status', 'reason', 'local_coverage', 'local_test', 'verification_command', 'last_checked_at', 'next_action', 'title', 'url']
        previous = {}
    for field in ['provider_updated_at', 'provider_checked_at', 'provider_labels', 'metadata_status']:
        if field not in fields:
            fields.append(field)
    added, changed = [], []
    metadata = []
    for issue in sorted(issues, key=lambda row: row['number']):
        number = issue['number']
        old = previous.get(number)
        row = dict(old or {field: '' for field in fields})
        updated = issue.get('updated_at', '')
        state = str(issue['state']).upper()
        labels = ', '.join(sorted(label['name'] for label in issue.get('labels', [])))
        if old is None:
            added.append(number)
            row.update(check='[ ]', issue=str(number), relevant='unchecked', classification='unchecked', owner='issue-harvester', status='unchecked', reason='Added by all-state metadata refresh; body, comments and source proof have not been reviewed.', next_action='Cluster and inspect the exact issue before deciding local performance or correctness relevance.')
        elif old.get('state') != state or old.get('title') != issue['title'] or updated > old.get('provider_updated_at', old.get('last_checked_at', '')):
            changed.append(number)
        row.update(state=state, title=issue['title'], url=issue.get('html_url', ''), provider_updated_at=updated, provider_checked_at=stamp, provider_labels=labels, metadata_status='new-unchecked' if old is None else 'needs-reread; existing semantic decision preserved' if number in changed else 'unchanged')
        previous[number] = row
        metadata.append({'number': number, 'title': issue['title'], 'state': state, 'url': row['url'], 'labels': labels, 'updatedAt': updated, 'metadataStatus': row['metadata_status']})
    with ledger.open('w') as handle:
        writer = csv.DictWriter(handle, fields, delimiter='\t', lineterminator='\n')
        writer.writeheader()
        writer.writerows({key: cell(value) for key, value in previous[number].items()} for number in sorted(previous))
    (output / 'issue-metadata.json').write_text(json.dumps({'checkedAt': stamp, 'stateCoverage': 'all', 'issues': metadata}, indent=2) + '\n')
    unchecked = [number for number, row in previous.items() if row.get('check') != '[x]']
    summary = {'repo': repo, 'checkedAt': stamp, 'mode': 'refresh-only', 'provider': 'Forgejo REST' if repo == 'wordgard' else 'GitHub REST via gh; gitcrawl archive last synced 2026-08-14 and API unsupported', 'pages': pages, 'paginationExhausted': True, 'providerRecordsIncludingPRs': len(records), 'currentIssues': len(issues), 'retainedLedgerRows': len(previous), 'added': added, 'materiallyChangedMetadata': changed, 'unchecked': unchecked, 'rawInputSha256': hashlib.sha256(raw_path.read_bytes()).hexdigest(), 'semanticDecisionsRevalidated': False}
    (output / 'metadata-refresh.json').write_text(json.dumps(summary, indent=2) + '\n')
    lines = [f'# {repo} issue metadata refresh', '', f'All-state metadata checked at {stamp}. {len(issues)} current issues; {len(added)} added; {len(changed)} changed metadata rows; {len(unchecked)} unchecked rows. Pagination reached the final page. Existing semantic checks are preserved, and changed metadata requires another read before reuse. This pass does not close issues or prove local behavior.', '', '[Detailed closure ledger](issue-closure-ledger.tsv) · [Refresh receipt](metadata-refresh.json)', '', '| Issue | State | Metadata | Previous check | Title |', '| --- | --- | --- | --- | --- |']
    for item in metadata:
        number = item['number']
        title = item['title'].replace('|', '\\|').replace('\n', ' ')
        lines.append(f"| [#{number}]({item['url']}) | {item['state']} | {item['metadataStatus']} | {previous[number]['check']} | {title} |")
    (output / 'issues.md').write_text('\n'.join(lines) + '\n')
    if not (output / 'issue-closure-ledger.md').exists():
        (output / 'issue-closure-ledger.md').write_text('\n'.join(lines) + '\n')
    else:
        with (output / 'issue-closure-ledger.md').open('a') as handle:
            handle.write(f'\n\n## Metadata refresh {stamp}\n\nThe current [all-state issue index](issues.md) and [TSV ledger](issue-closure-ledger.tsv) account for {len(issues)} issues and {len(unchecked)} unchecked rows. The older semantic rows above remain historical: {len(changed)} rows require another read after metadata changed. This refresh did not hydrate or decide those issues.\n')
    (artifact / f'{repo}-issue-refresh.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps({key: summary[key] for key in ['repo', 'currentIssues', 'retainedLedgerRows', 'pages']} | {'added': len(added), 'changed': len(changed), 'unchecked': len(unchecked)}))
