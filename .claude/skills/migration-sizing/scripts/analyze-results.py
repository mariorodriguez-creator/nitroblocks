#!/usr/bin/env python3
"""
Usage: python3 analyze-results.py <results-tsv> <output-json>

Reads the output of run-batch.py and produces a structured analysis JSON with:
  - templates: one entry per section, with dominant component signature,
               confidence level, and representative URL
  - blocks: unique component names ranked by cross-section frequency and reuse
  - summary: total URLs, sections, templates, blocks, sampled pages
"""

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path


SKIP_CLASSES = {
    "FETCH_FAILED", "TIMEOUT", "NO_CLASSES",
}

# Confidence based on number of OK pages sampled per section
def confidence(ok_count: int) -> str:
    if ok_count >= 10:
        return "high"
    if ok_count >= 3:
        return "med"
    return "low"


def top_classes(class_lists: list[list[str]], top_n: int = 5) -> list[tuple[str, float]]:
    """Return the top_n classes with their prevalence (0–1) across pages."""
    counter: Counter = Counter()
    total = len(class_lists)
    for classes in class_lists:
        for c in set(classes):  # count presence per page, not raw frequency
            counter[c] += 1
    return [(cls, count / total) for cls, count in counter.most_common(top_n)]


def main():
    if len(sys.argv) != 3:
        print("Usage: analyze-results.py <results-tsv> <output-json>")
        sys.exit(1)

    results_tsv = Path(sys.argv[1])
    output_json = Path(sys.argv[2])

    # Parse TSV
    section_data: dict[str, dict] = defaultdict(lambda: {"urls": [], "classes_per_page": [], "ok": 0, "failed": 0})

    with open(results_tsv) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split("|", 2)
            if len(parts) < 3:
                continue
            section, url, classes_str = parts

            if any(skip in classes_str for skip in SKIP_CLASSES):
                section_data[section]["failed"] += 1
                section_data[section]["urls"].append(url)
                continue

            classes = [c for c in classes_str.split(",") if c]
            section_data[section]["urls"].append(url)
            section_data[section]["classes_per_page"].append(classes)
            section_data[section]["ok"] += 1

    # Build block frequency across ALL sections
    all_class_counts: Counter = Counter()
    section_presence: dict[str, set] = defaultdict(set)  # class → sections where it appears

    for section, data in section_data.items():
        for page_classes in data["classes_per_page"]:
            for cls in set(page_classes):
                all_class_counts[cls] += 1
                section_presence[cls].add(section)

    total_pages = sum(d["ok"] for d in section_data.values())
    n_sections = len(section_data)

    # Build template entries
    templates = []
    for section, data in sorted(section_data.items()):
        ok = data["ok"]
        total_sampled = ok + data["failed"]
        conf = confidence(ok)
        top = top_classes(data["classes_per_page"], top_n=6)
        signature = ", ".join(f"{cls} ({pct:.0%})" for cls, pct in top)

        # Best representative URL: pick one with the most matching top-3 classes
        top3 = {cls for cls, _ in top[:3]}
        best_url = ""
        best_score = -1
        for url, page_classes in zip(data["urls"], data["classes_per_page"]):
            score = len(top3 & set(page_classes))
            if score > best_score:
                best_score = score
                best_url = url

        templates.append({
            "section": section,
            "total_sampled": total_sampled,
            "ok": ok,
            "failed": data["failed"],
            "confidence": conf,
            "signature": signature,
            "top_classes": [{"class": cls, "prevalence": round(pct, 2)} for cls, pct in top],
            "representative_url": best_url,
        })

    # Build block inventory
    blocks = []
    for cls, total_count in all_class_counts.most_common():
        sections_used = sorted(section_presence[cls])
        prevalence = total_count / total_pages if total_pages else 0
        blocks.append({
            "name": cls,
            "page_count": total_count,
            "prevalence": round(prevalence, 3),
            "sections": sections_used,
            "reuse_score": len(sections_used),  # how many distinct sections use it
        })

    # Summary
    summary = {
        "total_urls_sampled": total_pages + sum(d["failed"] for d in section_data.values()),
        "total_pages_ok": total_pages,
        "sections": n_sections,
        "templates_identified": n_sections,  # 1:1 initially; analyst may merge/split
        "blocks_identified": len(blocks),
        "high_confidence_templates": sum(1 for t in templates if t["confidence"] == "high"),
        "med_confidence_templates": sum(1 for t in templates if t["confidence"] == "med"),
        "low_confidence_templates": sum(1 for t in templates if t["confidence"] == "low"),
    }

    output = {
        "summary": summary,
        "templates": templates,
        "blocks": blocks,
    }

    with open(output_json, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nAnalysis complete:")
    print(f"  Sections / templates : {n_sections}")
    print(f"  Unique blocks found  : {len(blocks)}")
    print(f"  Pages OK             : {total_pages}")
    print(f"  Confidence           : {summary['high_confidence_templates']} high / "
          f"{summary['med_confidence_templates']} med / "
          f"{summary['low_confidence_templates']} low")
    print(f"\nOutput written to: {output_json}")


if __name__ == "__main__":
    main()
