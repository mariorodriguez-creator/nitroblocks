#!/usr/bin/env python3
"""
Usage: python3 run-batch-local.py <samples-dir> <mirror-dir> <output-tsv>

Reads sampled URL lists and extracts component class names from a local
scrape-site mirror instead of fetching pages from the network.

The mirror directory should be the output of the scrape-site skill:
  scrape/<hostname>/
    mirror-index.json
    index.html
    about/index.html
    ...

Each result line written to <output-tsv>: section|url|class1,class2,...
"""

import json
import os
import re
import sys
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse


# Matches multi-word kebab-case class names: 2+ lowercase words joined by hyphens
COMPONENT_RE = re.compile(r'\bclass="([^"]*)"')
VALID_CLASS_RE = re.compile(r'^[a-z][a-z0-9]*(-[a-z][a-z0-9]*)+$')
SKIP_PREFIXES = ('is-', 'has-', 'js-', 'no-', 'visually-', 'sr-', 'flex-', 'grid-')


def url_to_local_path(url: str, mirror_dir: Path) -> Optional[Path]:
    """Map a URL to its local HTML file in the mirror directory."""
    parsed = urlparse(url)
    path = parsed.path.rstrip('/')

    candidates = [
        mirror_dir / path.lstrip('/') / 'index.html',
        mirror_dir / (path.lstrip('/') + '.html'),
        mirror_dir / (path.lstrip('/') + '/index.html'),
    ]
    # Root
    if not path or path == '/':
        candidates.insert(0, mirror_dir / 'index.html')

    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def extract_classes(html: str) -> 'list[str]':
    """Extract component-like CSS class names from HTML."""
    found = set()
    for match in COMPONENT_RE.finditer(html):
        for cls in match.group(1).split():
            if (
                VALID_CLASS_RE.match(cls)
                and not any(cls.startswith(p) for p in SKIP_PREFIXES)
            ):
                found.add(cls)
    return sorted(found)


def main():
    if len(sys.argv) != 4:
        print("Usage: run-batch-local.py <samples-dir> <mirror-dir> <output-tsv>")
        sys.exit(1)

    samples_dir = Path(sys.argv[1])
    mirror_dir = Path(sys.argv[2])
    output_tsv = Path(sys.argv[3])

    if not mirror_dir.exists():
        print(f"Error: mirror directory not found: {mirror_dir}", file=sys.stderr)
        sys.exit(1)

    # Optionally load mirror-index.json to verify coverage
    index_path = mirror_dir / 'mirror-index.json'
    indexed_urls = set()
    if index_path.exists():
        with open(index_path) as f:
            data = json.load(f)
            # Support both {pages: [{url: ...}]} and flat list formats
            pages = data.get('pages', data) if isinstance(data, dict) else data
            indexed_urls = {p['url'] if isinstance(p, dict) else p for p in pages}

    # Process all sample files
    results = []
    total = ok = not_found = 0

    section_files = sorted(samples_dir.glob('sample_*.txt'))
    if not section_files:
        print(f"No sample_*.txt files found in {samples_dir}", file=sys.stderr)
        sys.exit(1)

    for sample_file in section_files:
        section = sample_file.stem[7:]  # strip "sample_"
        with open(sample_file) as f:
            urls = [line.strip() for line in f if line.strip()]

        for url in urls:
            total += 1
            local_path = url_to_local_path(url, mirror_dir)

            if local_path is None:
                results.append(f"{section}|{url}|NOT_IN_MIRROR")
                not_found += 1
                continue

            try:
                html = local_path.read_text(errors='replace')
                classes = extract_classes(html)
                classes_str = ','.join(classes) if classes else 'NO_CLASSES'
                results.append(f"{section}|{url}|{classes_str}")
                ok += 1
            except Exception as e:
                results.append(f"{section}|{url}|READ_ERROR:{e}")
                not_found += 1

    with open(output_tsv, 'w') as f:
        f.write('\n'.join(results) + '\n')

    print(f"\nDone. {ok} OK, {not_found} not found in mirror.")
    if not_found > 0:
        pct = not_found / total * 100
        print(f"  {pct:.0f}% of sampled URLs were not in the mirror.")
        print(f"  Re-run scrape-site with --max-pages 0 (no limit) to improve coverage,")
        print(f"  or fall back to run-batch.py (live fetch) for missing pages.")
    print(f"\nResults written to: {output_tsv}")


if __name__ == '__main__':
    main()
