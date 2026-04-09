#!/usr/bin/env python3
"""
Usage: python3 run-batch.py <samples-dir> <output-tsv> [--workers 20]

Reads all sample_*.txt files from <samples-dir> and runs parse-components.sh
for each URL in parallel. Writes results to <output-tsv> in the format:
  section|url|class1,class2,...

Progress is printed to stderr as pages complete.
"""

import os
import sys
import subprocess
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("samples_dir")
    parser.add_argument("output_tsv")
    parser.add_argument("--workers", type=int, default=20)
    return parser.parse_args()


def fetch_page(section: str, url: str) -> str:
    script = SCRIPT_DIR / "parse-components.sh"
    try:
        result = subprocess.run(
            ["bash", str(script), url, section],
            capture_output=True, text=True, timeout=30
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return f"{section}|{url}|TIMEOUT"
    except Exception as e:
        return f"{section}|{url}|ERROR:{e}"


def main():
    args = parse_args()
    samples_dir = Path(args.samples_dir)
    output_tsv = Path(args.output_tsv)

    # Collect all jobs
    jobs = []
    for sample_file in sorted(samples_dir.glob("sample_*.txt")):
        section = sample_file.stem[7:]  # strip "sample_"
        with open(sample_file) as f:
            for line in f:
                url = line.strip()
                if url:
                    jobs.append((section, url))

    total = len(jobs)
    print(f"Fetching {total} pages with {args.workers} workers ...", file=sys.stderr)

    completed = 0
    results = []

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(fetch_page, sec, url): (sec, url) for sec, url in jobs}

        for future in as_completed(futures):
            completed += 1
            result = future.result()
            results.append(result)

            if completed % 50 == 0 or completed == total:
                pct = completed / total * 100
                print(f"  {completed}/{total} ({pct:.0f}%)", file=sys.stderr)

    with open(output_tsv, "w") as f:
        f.write("\n".join(results) + "\n")

    # Quick summary
    failed = sum(1 for r in results if "FETCH_FAILED" in r or "TIMEOUT" in r or "ERROR:" in r)
    print(f"\nDone. {total - failed} OK, {failed} failed. Results: {output_tsv}", file=sys.stderr)


if __name__ == "__main__":
    main()
