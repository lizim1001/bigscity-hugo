"""Lossless extraction of the cleaned legacy web site into Hugo HTML content."""
import argparse
import hashlib
import json
import re
import shutil
from html.parser import HTMLParser
from pathlib import Path
import yaml


class ContentBoundary(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text = text
        self.lines = [0]
        for m in re.finditer('\n', text):
            self.lines.append(m.end())
        self.depth = 0
        self.start = None
        self.end = None

    def absolute_offset(self):
        line, column = self.getpos()
        return self.lines[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if tag == 'div':
            if self.start is None and dict(attrs).get('id') == 'content_area':
                self.start = self.absolute_offset() + len(self.get_starttag_text())
                self.depth = 1
            elif self.start is not None and self.end is None:
                self.depth += 1

    def handle_endtag(self, tag):
        if tag == 'div' and self.start is not None and self.end is None:
            self.depth -= 1
            if self.depth == 0:
                self.end = self.absolute_offset()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=Path(__file__).resolve().parents[2] / 'web')
    args = parser.parse_args()
    source = args.source.resolve()
    project = Path(__file__).resolve().parents[1]
    if (project / 'content').exists():
        raise SystemExit('content already exists. Use a fresh project; never overwrite manual edits.')
    shells = {}
    manifest = []
    excluded = {'temp', 'assets', 'assets.jimstatic.com', 'image.jimcdn.com', 'u.jimcdn.com', 'fonts.jimstatic.com', project.name}
    for file in sorted(source.rglob('*.html')):
        relative = file.relative_to(source)
        if relative.parts[0] in excluded or any(p.startswith('.backup_') for p in relative.parts) or file.name == 'font-test.html':
            continue
        text = file.read_text(encoding='utf-8')
        boundary = ContentBoundary(text)
        boundary.feed(text)
        if boundary.start is None or boundary.end is None:
            raise RuntimeError('Missing content boundary: ' + str(relative))
        prefix, body, suffix = text[:boundary.start], text[boundary.start:boundary.end], text[boundary.end:]
        key = hashlib.sha256((prefix + suffix).encode()).hexdigest()[:20]
        shells[key] = {'prefix': prefix, 'suffix': suffix}
        title = re.search(r'<title[^>]*>(.*?)</title>', text, re.S).group(1)
        title = re.sub(r' - Beihang Interest Group.*$', '', title)
        route = '/' + relative.parent.as_posix().strip('.') + '/'
        if relative == Path('index.html'):
            route = '/'
        meta = {'title': title, 'url': route, 'legacy_key': key, 'legacy_source': relative.as_posix()}
        if relative == Path('index.html'):
            dest = project / 'content' / '_index.html'
            default_prefix = prefix
            default_suffix = suffix
        else:
            is_section = any(child.parent != file.parent and not any(p.startswith('.backup_') for p in child.parts) for child in file.parent.rglob('index.html'))
            dest = project / 'content' / relative.parent / ('_index.html' if is_section else 'index.html')
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text('---\n' + yaml.safe_dump(meta, allow_unicode=True, sort_keys=False) + '---\n' + body, encoding='utf-8')
        manifest.append({'source': relative.as_posix(), 'url': route, 'body_sha256': hashlib.sha256(body.encode()).hexdigest()})
    # A root-relative version of the original home shell supports newly added nested pages.
    roots = ('assets.jimstatic.com', 'u.jimcdn.com', 'image.jimcdn.com', 'fonts.jimstatic.com', 'jingyuan-wang', 'publications', 'students-alumni', 'libcity', 'visualizations', 'seminars', 'readings', 'contact-us')
    for root in roots:
        default_prefix = default_prefix.replace('"' + root + '/', '"/' + root + '/').replace("'" + root + '/', "'/" + root + '/')
    default_prefix = default_prefix.replace('href="index.html"', 'href="/"')
    default_prefix = re.sub(r'<title>.*?</title>', '<title>__PAGE_TITLE__ - BIGSCity</title>', default_prefix, flags=re.S)
    shells['default'] = {'prefix': default_prefix, 'suffix': default_suffix}
    data = project / 'data'
    data.mkdir(exist_ok=True)
    (data / 'legacy.json').write_text(json.dumps(shells, ensure_ascii=False), encoding='utf-8')
    (project / 'tools' / 'migration-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    static = project / 'static'
    static.mkdir(exist_ok=True)
    for name in ('downloads', 'image.jimcdn.com', 'assets.jimstatic.com', 'u.jimcdn.com', 'fonts.jimstatic.com', 'assets'):
        shutil.copytree(source / name, static / name)
    shutil.copy2(source / 'CNAME', static / 'CNAME')
    print(f'Migrated {len(manifest)} HTML pages without converting or reformatting their body HTML.')


if __name__ == '__main__':
    main()
