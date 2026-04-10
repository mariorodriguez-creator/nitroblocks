#!/usr/bin/env python3
"""
Run structural fingerprinting on ALL URLs (no sampling).
Usage: python3 run-full.py <urls-txt> <mirror-dir> <output-tsv>
"""
import re
import sys
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

COMPONENT_RE = re.compile(r'\bclass="([^"]*)"')
VALID_CLASS_RE = re.compile(r'^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)+$')
SKIP_PREFIXES = ('is-', 'has-', 'js-', 'no-', 'visually-', 'sr-', 'flex-', 'grid-')


def url_to_local_path(url: str, mirror_dir: Path) -> Optional[Path]:
    parsed = urlparse(url)
    path = parsed.path.rstrip('/')
    path_no_ext = path[:-5] if path.endswith('.html') else path
    candidates = [
        mirror_dir / path_no_ext.lstrip('/') / 'index.html',
        mirror_dir / path.lstrip('/'),
        mirror_dir / (path_no_ext.lstrip('/') + '.html'),
        mirror_dir / path.lstrip('/') / 'index.html',
    ]
    if not path or path == '/':
        candidates.insert(0, mirror_dir / 'index.html')
    for c in candidates:
        try:
            if c.exists() and c.is_file():
                return c
        except OSError:
            continue
    return None


def section_for(url: str) -> str:
    parsed = urlparse(url)
    parts = [p for p in parsed.path.strip('/').split('/') if p]
    if not parts:
        return 'root'
    seg = parts[0].replace('.html', '')
    return seg if seg else 'root'


def extract_classes(html: str):
    found = set()
    for m in COMPONENT_RE.finditer(html):
        for cls in m.group(1).split():
            if VALID_CLASS_RE.match(cls) and not any(cls.startswith(p) for p in SKIP_PREFIXES):
                found.add(cls)
    return sorted(found)


def main():
    if len(sys.argv) != 4:
        print("Usage: run-full.py <urls-txt> <mirror-dir> <output-tsv>")
        sys.exit(1)

    urls_file = Path(sys.argv[1])
    mirror_dir = Path(sys.argv[2])
    output_tsv = Path(sys.argv[3])

    urls = [l.strip() for l in urls_file.read_text().splitlines() if l.strip()]
    total = len(urls)
    print(f"Processing {total} URLs from {urls_file} ...")

    results = []
    ok = not_found = 0
    for i, url in enumerate(urls, 1):
        if i % 100 == 0:
            print(f"  {i}/{total} ({ok} ok, {not_found} not found)", flush=True)
        sec = section_for(url)
        local = url_to_local_path(url, mirror_dir)
        if local is None:
            results.append(f"{sec}|{url}|NOT_IN_MIRROR")
            not_found += 1
            continue
        try:
            html = local.read_text(errors='replace')
            classes = extract_classes(html)
            results.append(f"{sec}|{url}|{','.join(classes) if classes else 'NO_CLASSES'}")
            ok += 1
        except Exception as e:
            results.append(f"{sec}|{url}|READ_ERROR:{e}")
            not_found += 1

    output_tsv.write_text('\n'.join(results) + '\n')
    print(f"\nDone: {ok} OK, {not_found} not found ({not_found/total*100:.1f}% miss rate)")
    print(f"Results → {output_tsv}")


if __name__ == '__main__':
    main()
