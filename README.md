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
- **Security Hardened**: SSRF protection, input validation, sandboxed browser

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

# With self-signed cert (staging environments)
node responsive-audit/scripts/responsive-audit.js https://staging.myapp.com \
  --ignore-https-errors
```

### Skill Structure

```
responsive-audit/
├── SKILL.md                   # Agent instructions (8 phases)
├── scripts/
│   └── responsive-audit.js    # Puppeteer automation script (security hardened)
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

### Security

The script includes security hardening:

| Protection | Description |
|---|---|
| URL Scheme Restriction | Only `http://` and `https://` accepted |
| SSRF Protection | Cloud metadata endpoints blocked |
| Output Path Sanitization | Output stays within working directory |
| Input Validation | Breakpoints bounded (200-7680px), paths sanitized |
| Chromium Sandboxing | Enabled by default; `--no-sandbox` is opt-in |
| Link Check Limit | Max 200 links per page |
| Request Throttling | 200ms delay between requests to same host |
| Data Sanitization | No raw HTML or stack traces in reports |
| Global Timeout | 5-minute default prevents infinite hangs |
| File Permissions | Reports written with owner-only access (0o600) |

### Requirements

- Node.js 18+
- Puppeteer (auto-installed on first run)

---

