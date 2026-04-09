#!/usr/bin/env python3
"""
strip-cookie-banners.py — Remove cookie consent banners from scraped HTML files.

Works generically for any site / CMP by using two strategies:

  Strategy 1 — Known container IDs/classes:
    Removes root elements for all major CMPs (OneTrust, CookieReports,
    Cookiebot, TrustArc, SourcePoint, Quantcast, etc.).

  Strategy 2 — Heuristic structural removal:
    Finds elements with inline `position:fixed` + high `z-index` whose
    content or attributes contain cookie/consent keywords. These are the
    overlay characteristics shared by virtually every CMP regardless of
    brand-specific naming.

Usage:
    python3 strip-cookie-banners.py <site-dir>

Example:
    python3 strip-cookie-banners.py ./scrape/www.example.com
"""

import os
import re
import sys


# ---------------------------------------------------------------------------
# Known CMP container IDs — removed unconditionally when found
# ---------------------------------------------------------------------------
KNOWN_IDS = [
    # CookieReports (e.g. AstraZeneca)
    'CookieReportsPanel',
    'CookieReportsBannerAZ',
    # OneTrust
    'onetrust-consent-sdk',
    'onetrust-banner-sdk',
    'onetrust-pc-sdk',
    # Cookiebot
    'CybotCookiebotDialog',
    'CybotCookiebotDialogBodyUnderlay',
    # TrustArc
    'truste-consent-track',
    'truste-consent-required',
    # SourcePoint
    'sp_message_container',
    # Quantcast
    'qc-cmp2-ui',
    'qc-cmp2-persistent-link',
    # Evidon
    'evidon-banner',
    'evidon-prefdiag-overlay',
    # Cookie Consent (open source lib)
    'cc-banner',
    'cc--anim',
    # Generic
    'cookiebanner',
    'cookie-banner',
    'cookie-notice',
    'cookie-consent',
    'cookie-bar',
    'cookie-alert',
    'gdpr-banner',
    'gdpr-consent',
    'consent-banner',
    'consent-overlay',
    'privacy-banner',
]

# ---------------------------------------------------------------------------
# Known CMP <style> IDs — removed unconditionally
# ---------------------------------------------------------------------------
KNOWN_STYLE_IDS = [
    'CookieReportsStyle',
    'onetrust-style',
]

# ---------------------------------------------------------------------------
# Script/link src patterns — <script> and <link> tags pointing to CMP CDNs
# ---------------------------------------------------------------------------
CMP_SRC_PATTERNS = [
    r'cookiereports\.com',
    r'cdn\.cookielaw\.org',           # OneTrust
    r'optanon\.blob\.core\.windows',  # OneTrust
    r'consent\.cookiebot\.com',       # Cookiebot
    r'cookie-cdn\.cookiepro\.com',    # CookiePro
    r'cdn\.cookie-script\.com',       # Cookie-Script
    r'cdn\.trustarc\.com',            # TrustArc
    r'sourcepoint\.com',              # SourcePoint
    r'quantcast\.mgr\.consensu\.org', # Quantcast
    r'evidon\.com.*tag',              # Evidon
    r'cookiehub\.net',                # CookieHub
    r'app\.termly\.io',               # Termly
    r'cdn\.iubenda\.com.*cookie',     # Iubenda
]
CMP_SRC_RE = re.compile('|'.join(CMP_SRC_PATTERNS), re.IGNORECASE)

# ---------------------------------------------------------------------------
# Heuristic keywords — used to confirm an element is cookie-related
# ---------------------------------------------------------------------------
COOKIE_KEYWORDS_RE = re.compile(
    r'cookie|consent|gdpr|ccpa|privacy.{0,30}notice|we use|tracking|'
    r'your experience|personal.{0,10}data',
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# HTML element removal helpers
# ---------------------------------------------------------------------------

def remove_element_by_id(html: str, element_id: str) -> str:
    """
    Remove the first element with the given id attribute, including all its
    children, from an HTML string. Works by counting open/close tag depth.
    """
    # Match the opening tag (any HTML element name)
    open_re = re.compile(
        r'<(\w+)[^>]*\bid=["\']' + re.escape(element_id) + r'["\'][^>]*>',
        re.IGNORECASE,
    )
    m = open_re.search(html)
    if not m:
        return html

    tag = m.group(1).lower()
    start = m.start()
    pos = m.end()

    # Void elements (self-closing in HTML5) have no children to walk
    if tag in ('br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'):
        return html[:start] + html[pos:]

    depth = 1
    open_tag_re = re.compile(r'<' + tag + r'[\s>]', re.IGNORECASE)
    close_tag_re = re.compile(r'</' + tag + r'\s*>', re.IGNORECASE)

    while depth > 0 and pos < len(html):
        next_open = open_tag_re.search(html, pos)
        next_close = close_tag_re.search(html, pos)

        if not next_close:
            break  # Malformed HTML — bail out, remove just the opening tag

        if next_open and next_open.start() < next_close.start():
            depth += 1
            pos = next_open.end()
        else:
            depth -= 1
            if depth == 0:
                return html[:start] + html[next_close.end():]
            pos = next_close.end()

    # Fallback: remove only the opening tag
    return html[:start] + html[m.end():]


def remove_style_by_id(html: str, style_id: str) -> str:
    """Remove a <style id="...">...</style> block."""
    return re.sub(
        r'<style[^>]*\bid=["\']' + re.escape(style_id) + r'["\'][^>]*>[\s\S]*?</style>',
        '',
        html,
        flags=re.IGNORECASE,
    )


def remove_cmp_scripts(html: str) -> str:
    """Remove <script> and <link> tags that load known CMP libraries."""
    # <script src="...cmp-cdn..."></script>  or  <script src="..." />
    html = re.sub(
        r'<script[^>]+src=["\'][^"\']*' + CMP_SRC_RE.pattern + r'[^"\']*["\'][^>]*>[\s\S]*?</script>',
        '',
        html,
        flags=re.IGNORECASE,
    )
    html = re.sub(
        r'<script[^>]+src=["\'][^"\']*' + CMP_SRC_RE.pattern + r'[^"\']*["\'][^>]*/?>',
        '',
        html,
        flags=re.IGNORECASE,
    )
    # <link href="...cmp-cdn..." rel="stylesheet">
    html = re.sub(
        r'<link[^>]+href=["\'][^"\']*' + CMP_SRC_RE.pattern + r'[^"\']*["\'][^>]*/?>',
        '',
        html,
        flags=re.IGNORECASE,
    )
    return html


# Matches inline style="position:fixed..." or style="position: fixed..."
FIXED_POS_RE = re.compile(r'position\s*:\s*fixed', re.IGNORECASE)
# Matches z-index values of 999 or higher (3+ digit, or 4+ digit)
HIGH_ZINDEX_RE = re.compile(r'z-index\s*:\s*(\d{3,})', re.IGNORECASE)


def remove_heuristic_overlays(html: str) -> str:
    """
    Heuristic removal: find elements with inline style containing
    position:fixed + z-index >= 999 that contain cookie/consent keywords.

    This catches any CMP not covered by the known-ID list above.
    """
    # Find all inline-styled elements with fixed positioning
    tag_re = re.compile(
        r'<(\w+)[^>]+style=["\'][^"\']*position\s*:\s*fixed[^"\']*["\'][^>]*>',
        re.IGNORECASE,
    )

    offset = 0
    result_parts = []

    for m in tag_re.finditer(html):
        tag = m.group(1).lower()
        style_attr = m.group(0)

        # Check z-index
        zi_match = HIGH_ZINDEX_RE.search(style_attr)
        if not zi_match or int(zi_match.group(1)) < 999:
            continue

        # Grab a chunk of this element's content to check for keywords
        # (up to 2000 chars is enough to capture banner text without full parse)
        content_sample = html[m.start():m.start() + 2000]
        if not COOKIE_KEYWORDS_RE.search(content_sample):
            continue

        # This looks like a cookie overlay — remove it
        result_parts.append(html[offset:m.start()])

        # Walk forward to find the matching closing tag
        pos = m.end()
        depth = 1
        open_re = re.compile(r'<' + tag + r'[\s>]', re.IGNORECASE)
        close_re = re.compile(r'</' + tag + r'\s*>', re.IGNORECASE)
        end = m.end()

        while depth > 0 and pos < len(html):
            next_open = open_re.search(html, pos)
            next_close = close_re.search(html, pos)
            if not next_close:
                break
            if next_open and next_open.start() < next_close.start():
                depth += 1
                pos = next_open.end()
            else:
                depth -= 1
                end = next_close.end()
                pos = end
                if depth == 0:
                    break

        offset = end

    result_parts.append(html[offset:])
    return ''.join(result_parts)


def unlock_body_scroll(html: str) -> str:
    """Remove overflow:hidden/overflow:scroll locks CMPs add to <body>/<html>."""
    html = re.sub(
        r'(<body[^>]+style=["\'])([^"\']*)',
        lambda m: m.group(1) + re.sub(r'overflow\s*:[^;]+;?\s*', '', m.group(2)),
        html, flags=re.IGNORECASE,
    )
    html = re.sub(
        r'(<html[^>]+style=["\'])([^"\']*)',
        lambda m: m.group(1) + re.sub(r'overflow\s*:[^;]+;?\s*', '', m.group(2)),
        html, flags=re.IGNORECASE,
    )
    return html


# ---------------------------------------------------------------------------
# Main processing
# ---------------------------------------------------------------------------

def strip_cookie_banners(html: str) -> str:
    """Apply all banner-removal strategies to an HTML string."""
    # 1. Remove known CMP <style> blocks
    for style_id in KNOWN_STYLE_IDS:
        html = remove_style_by_id(html, style_id)

    # 2. Remove known CMP root containers by ID
    for container_id in KNOWN_IDS:
        html = remove_element_by_id(html, container_id)

    # 3. Remove CMP <script>/<link> loader tags
    html = remove_cmp_scripts(html)

    # 4. Heuristic: remove any remaining fixed-position, high-z-index overlays
    #    that contain cookie/consent-related text
    html = remove_heuristic_overlays(html)

    # 5. Unlock body scroll
    html = unlock_body_scroll(html)

    return html


def process_directory(site_dir: str) -> None:
    count = 0
    modified = 0
    errors = 0

    for root, dirs, files in os.walk(site_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for fname in files:
            if not fname.endswith('.html'):
                continue
            count += 1
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, encoding='utf-8', errors='replace') as f:
                    before = f.read()
                after = strip_cookie_banners(before)
                if after != before:
                    with open(fpath, 'w', encoding='utf-8') as f:
                        f.write(after)
                    modified += 1
            except Exception as exc:
                print(f'  ERROR {fpath}: {exc}', file=sys.stderr)
                errors += 1

    print(f'Processed {count} HTML files')
    print(f'Modified  {modified} files (cookie banners removed)')
    if errors:
        print(f'Errors    {errors} (see stderr)')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(f'Usage: python3 {os.path.basename(__file__)} <site-dir>')
        print(f'Example: python3 {os.path.basename(__file__)} ./scrape/www.example.com')
        sys.exit(1)

    site_dir = sys.argv[1]
    if not os.path.isdir(site_dir):
        print(f'Error: directory not found: {site_dir}', file=sys.stderr)
        sys.exit(1)

    process_directory(site_dir)
