#!/usr/bin/env python3
"""
Usage: python3 sample-urls.py <sections-dir> <output-dir>

Applies stratified sampling to URL section files produced by extract-urls.sh:
  < 100 pages  → 100%
  100-200 pages → 50%
  > 200 pages   → 25%

Writes sample_<section>.txt files to <output-dir> and prints a summary.
"""

import os
import sys
import random

THRESHOLDS = [
    (100,  1.0),   # <100 pages → 100%
    (200,  0.5),   # 100-200  → 50%
    (None, 0.25),  # >200     → 25%
]


def sample_rate(count: int) -> float:
    for limit, rate in THRESHOLDS:
        if limit is None or count < limit:
            return rate
    return 0.25


def main():
    if len(sys.argv) != 3:
        print("Usage: sample-urls.py <sections-dir> <output-dir>")
        sys.exit(1)

    sections_dir = sys.argv[1]
    output_dir = sys.argv[2]
    os.makedirs(output_dir, exist_ok=True)

    section_files = sorted(
        f for f in os.listdir(sections_dir) if f.startswith("sec_") and f.endswith(".txt")
    )

    print(f"\n{'Section':<28} {'Total':>6} {'Rate':>6} {'Sampled':>8}")
    print("-" * 54)

    grand_total = 0
    grand_sampled = 0

    for filename in section_files:
        section = filename[4:-4]  # strip sec_ and .txt
        filepath = os.path.join(sections_dir, filename)

        with open(filepath) as f:
            urls = [line.strip() for line in f if line.strip()]

        count = len(urls)
        rate = sample_rate(count)
        k = max(1, round(count * rate))

        random.seed(42)  # reproducible samples
        sampled = random.sample(urls, min(k, count))

        out_path = os.path.join(output_dir, f"sample_{section}.txt")
        with open(out_path, "w") as f:
            f.write("\n".join(sampled) + "\n")

        grand_total += count
        grand_sampled += len(sampled)

        print(f"{section:<28} {count:>6} {rate*100:>5.0f}% {len(sampled):>8}")

    print("-" * 54)
    overall_rate = grand_sampled / grand_total * 100 if grand_total else 0
    print(f"{'TOTAL':<28} {grand_total:>6} {overall_rate:>5.0f}% {grand_sampled:>8}")
    print(f"\nSample files written to: {output_dir}")


if __name__ == "__main__":
    main()
