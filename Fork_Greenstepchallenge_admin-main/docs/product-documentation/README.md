# Product Documentation

CISC 480 capstone deliverable. Single LaTeX document covering all five
required sub-documents:

1. Product Requirement Document (use cases + user stories)
2. UX/UI Design Specification (story map, journey, accessibility)
3. Technical Design Document (C4 diagrams, ER, sequence, deployment)
4. Source Code Documentation (structure, naming, comments)
5. QA Activities Document (test plan, test cases, defect reports)

## Files

| File | Purpose |
|------|---------|
| `PRODUCT_DOCUMENTATION.tex` | LaTeX source |
| `PRODUCT_DOCUMENTATION.pdf` | Compiled output (24 pages) |
| `diagrams/*.mmd` | Mermaid sources for all 10 diagrams |
| `diagrams/*.png` | Pre-rendered diagrams embedded in the PDF |

## Rebuilding

```bash
# Re-render diagrams (after editing .mmd files):
cd diagrams
for f in *.mmd; do
  npx -y @mermaid-js/mermaid-cli@latest -i "$f" -o "${f%.mmd}.png" \
    -b transparent -w 1600
done

# Re-compile the PDF (run twice for cross-references + TOC):
cd ..
pdflatex PRODUCT_DOCUMENTATION.tex
pdflatex PRODUCT_DOCUMENTATION.tex
```

Requires a TeX distribution (TeX Live or MacTeX) and Node.js for the
mermaid CLI.
