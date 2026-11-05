"""Compare generated HTML against the cleaned source snapshot and check asset hashes."""
import argparse
import hashlib
import json
from pathlib import Path
from migrate_original import ContentBoundary


def normalized(value):
    return value.replace('\r\n', '\n').strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    args = parser.parse_args()
    project = Path(__file__).resolve().parents[1]
    manifest = json.loads((project / 'tools/migration-manifest.json').read_text(encoding='utf-8'))
    failures = []
    for row in manifest:
        source = (args.source / row['source']).read_text(encoding='utf-8')
        generated = (project / 'public' / row['source']).read_text(encoding='utf-8')
        original_boundary = ContentBoundary(source)
        output_boundary = ContentBoundary(generated)
        original_boundary.feed(source)
        output_boundary.feed(generated)
        if output_boundary.start is None:
            failures.append(row['source'] + ': missing original content wrapper')
            continue
        for label, left, right in (
            ('prefix', source[:original_boundary.start], generated[:output_boundary.start]),
            ('body', source[original_boundary.start:original_boundary.end], generated[output_boundary.start:output_boundary.end]),
            ('suffix', source[original_boundary.end:], generated[output_boundary.end:]),
        ):
            if normalized(left) != normalized(right):
                failures.append(row['source'] + ': ' + label + ' differs')
    assets = 0
    for name in ('downloads', 'image.jimcdn.com', 'assets.jimstatic.com', 'u.jimcdn.com', 'fonts.jimstatic.com', 'assets'):
        for original in (args.source / name).rglob('*'):
            if original.is_file():
                migrated = project / 'static' / original.relative_to(args.source)
                if hashlib.sha256(original.read_bytes()).digest() != hashlib.sha256(migrated.read_bytes()).digest():
                    failures.append(str(original) + ': asset differs')
                assets += 1
    print(f'Pages compared: {len(manifest)} (prefix, body, suffix independently)')
    print(f'Assets compared by SHA-256: {assets}')
    print(f'Differences: {len(failures)}')
    for failure in failures[:30]:
        print(failure)
    raise SystemExit(1 if failures else 0)


if __name__ == '__main__':
    main()
