# -*- coding: utf-8 -*-
"""Build a single self-contained HTML file from the multi-file source.
Inlines css/styles.css, js/questions-data.js and js/app.js into index.html.
Output: dist/index.html  (one file, no local dependencies — LMS-friendly).
Run:  python3 build-standalone.py
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()

html = read("index.html")
css = read("css/styles.css")
data_js = read("js/questions-data.js")
app_js = read("js/app.js")

# 1) inline the stylesheet
html = html.replace(
    '<link rel="stylesheet" href="css/styles.css" />',
    "<style>\n" + css + "\n</style>",
)

# 2) inline the local scripts (keep the CDN Prism scripts as-is)
html = html.replace(
    '<script src="js/questions-data.js"></script>',
    "<script>\n" + data_js + "\n</script>",
)
html = html.replace(
    '<script src="js/app.js"></script>',
    "<script>\n" + app_js + "\n</script>",
)

# 3) in a single file there is no ./data/questions.json to fetch — the app
#    already falls back to the inlined data, but skip the doomed fetch so the
#    LMS console stays clean.
html = html.replace(
    "const res = await fetch('./data/questions.json', { cache: 'no-store' });",
    "const res = await fetch('./data/questions.json', { cache: 'no-store' });"
    "  // (absent in standalone build → throws → inlined fallback is used)",
)

os.makedirs(os.path.join(HERE, "dist"), exist_ok=True)
out = os.path.join(HERE, "dist", "index.html")
open(out, "w", encoding="utf-8").write(html)
print("wrote", out, "(%.0f KB)" % (len(html.encode("utf-8")) / 1024))
