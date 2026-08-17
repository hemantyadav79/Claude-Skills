# Skills For Testing Responsiveness of the UI/UX

A collection of AI agent skills for automated development workflows.

---

## 📱 responsive-audit

A comprehensive responsive design audit skill that performs automated testing across all screen sizes, themes, and checks for broken links.

### Features

- **9 Breakpoints**: 320px → 2560px (Mobile, Tablet, Desktop, Ultra-Wide)
- **Theme Testing**: Light & Dark mode with WCAG contrast ratio checks
- **Broken Link Detection**: Source code + live page URL scanning
- **Code Analysis**: Detects responsive anti-patterns in CSS/HTML
- **Accessibility**: Touch targets, font sizes, focus indicators
- **Multi-Page**: Tests multiple routes in SPAs and MPAs
- **Monorepo Support**: Intelligently scans only frontend code

### Quick Start

```bash
# Run on any local dev server
node responsive-audit/scripts/responsive-audit.js http://localhost:3000

# Custom breakpoints and pages
node responsive-audit/scripts/responsive-audit.js http://localhost:8000 \
  --breakpoints 375,768,1440 \
  --pages /,/about,/dashboard

# Dark mode only
node responsive-audit/scripts/responsive-audit.js http://localhost:5173 \
  --theme dark
```

### Skill Structure

```
responsive-audit/
├── SKILL.md                   # Agent instructions (8 phases)
├── scripts/
│   └── responsive-audit.js    # Puppeteer automation script
├── references/
│   └── breakpoints.md         # Device & breakpoint reference
└── resources/
    └── report-template.md     # Markdown report template
```

### Audit Phases

| Phase | What it does |
|---|---|
| 0. Pre-Flight | Verifies URL, detects tech stack & project structure |
| 1. Code Analysis | Scans source for responsive anti-patterns |
| 2. Browser Testing | Screenshots + layout checks at 9 breakpoints |
| 3. Multi-Page | Tests routes, nav menus, modals, forms, tables |
| 4. Broken Links | Dead URLs in source code + live page |
| 5. Theme & Contrast | Light vs Dark WCAG contrast comparison |
| 6. Accessibility | Touch targets, font sizes, focus, reflow |
| 7. Report | Comprehensive Markdown report with screenshots |

### Requirements

- Node.js 18+
- Puppeteer (auto-installed on first run)

---

