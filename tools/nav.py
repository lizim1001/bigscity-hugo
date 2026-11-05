"""Manage newly added main-navigation items without rewriting legacy HTML."""
import argparse
import hashlib
import html
import json
import re
import shutil
from datetime import datetime
from pathlib import Path


def nav_end(prefix):
    start = re.search(r'<ul\b[^>]*\bid\s*=\s*[\"\']mainNav1[\"\'][^>]*>', prefix, re.I)
    if not start:
        raise ValueError('mainNav1 not found')
    depth = 1
    for token in re.finditer(r'</?ul\b[^>]*>', prefix[start.end():], re.I):
        depth += -1 if token.group().startswith('</') else 1
        if depth == 0:
            return start.end() + token.start()
    raise ValueError('mainNav1 closing tag not found')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['add', 'remove'])
    parser.add_argument('--url', required=True, help='Root-relative URL, e.g. /news/')
    parser.add_argument('--label', help='Visible navigation label (required for add)')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    if not args.url.startswith('/') or args.url.startswith('//') or any(c in args.url for c in '\r\n\"\'<>'):
        parser.error('Use a root-relative URL without quotes, e.g. /news/')
    if args.action == 'add' and not args.label:
        parser.error('--label is required for add')
    file = Path(__file__).resolve().parents[1] / 'data' / 'legacy.json'
    shells = json.loads(file.read_text(encoding='utf-8'))
    identifier = 'hugo-nav-' + hashlib.sha256(args.url.encode()).hexdigest()[:12]
    changed = 0
    for key, shell in shells.items():
        prefix = shell['prefix']
        end = nav_end(prefix)
        if args.action == 'add':
            hrefs = re.findall(r'\bhref=[\"\']([^\"\']*)[\"\']', prefix[:end])
            if any(html.unescape(href) == args.url for href in hrefs):
                continue
            item = f'<li id="{identifier}"><a href="{html.escape(args.url, quote=True)}" class="level_1"><span>{html.escape(args.label)}</span></a></li>\n'
            updated = prefix[:end] + item + prefix[end:]
        else:
            updated = re.sub(r'<li id="' + re.escape(identifier) + r'">.*?</li>\n?', '', prefix, flags=re.S)
        if updated != prefix:
            shell['prefix'] = updated
            changed += 1
    print(f'{args.action}: {changed} page shells will change')
    if args.dry_run or not changed:
        return
    backup = file.with_name('legacy.json.backup-' + datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
    shutil.copy2(file, backup)
    file.write_text(json.dumps(shells, ensure_ascii=False), encoding='utf-8')
    print('Backup: ' + str(backup))
    print('Done. Preview with hugo server.')


if __name__ == '__main__':
    main()
