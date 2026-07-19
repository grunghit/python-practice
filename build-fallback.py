#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate js/questions-data.js (the offline fallback) from data/questions.json.

data/questions.json is the single source of truth. js/questions-data.js is a
*generated* artifact — a byte-for-byte mirror used when the site is opened via
file:// (where fetch() is blocked). Never hand-edit it.

Usage:
  python3 build-fallback.py            regenerate js/questions-data.js
  python3 build-fallback.py --check    verify it is in sync; exit 1 if not (CI)

The --check mode does a byte-exact comparison against what this script would
generate, so any content OR formatting drift is caught. JSON separators are
pinned so the output is stable across Python versions.
"""
import os
import sys
import json

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "data", "questions.json")
OUT = os.path.join(HERE, "js", "questions-data.js")

HEADER = (
    "// Auto-generated offline fallback — mirror of data/questions.json (do not hand-edit).\n"
    "// Lets the site work when opened via file:// where fetch() is blocked.\n"
)


def rel(path):
    return os.path.relpath(path, HERE)


def load_source():
    """Load and lightly validate questions.json. Returns the parsed dict."""
    try:
        with open(SRC, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        raise SystemExit(f"error: source not found: {rel(SRC)}")
    except json.JSONDecodeError as e:
        raise SystemExit(f"error: {rel(SRC)} is not valid JSON: {e}")
    if not isinstance(data, dict) or not isinstance(data.get("questions"), list):
        raise SystemExit(f'error: {rel(SRC)} must be an object with a "questions" array')
    return data


def render(data):
    """Produce the exact file contents for the given parsed data."""
    payload = json.dumps(data, ensure_ascii=False, indent=2, separators=(",", ": "))
    return HEADER + "window.__QUESTIONS_FALLBACK__ = " + payload + ";\n"


def main(argv):
    check = "--check" in argv[1:]
    generated = render(load_source())
    n = len(json.loads(generated[generated.index("{"):generated.rindex("}") + 1])["questions"])

    if check:
        try:
            with open(OUT, encoding="utf-8") as f:
                current = f.read()
        except FileNotFoundError:
            print(f"OUT OF SYNC: {rel(OUT)} is missing. "
                  f"Regenerate with:  python3 {os.path.basename(__file__)}",
                  file=sys.stderr)
            return 1
        if current == generated:
            print(f"in sync: {rel(OUT)} matches {rel(SRC)} ({n} questions)")
            return 0
        print(f"OUT OF SYNC: {rel(OUT)} does not match {rel(SRC)}.\n"
              f"Regenerate with:  python3 {os.path.basename(__file__)}",
              file=sys.stderr)
        return 1

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(generated)
    print(f"wrote {rel(OUT)} ({len(generated.encode('utf-8'))} bytes, {n} questions)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
