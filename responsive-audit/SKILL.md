---
name: responsive-audit
description: >-
  Comprehensive responsive design audit skill. Use when the user asks to test,
  check, or audit responsive design, screen compatibility, mobile/tablet/desktop
  responsiveness, broken links, dark/light theme contrast, or layout issues on
  any web project. Works with any URL, any port, monorepos, and all web frameworks.
  Actions: responsive audit, responsiveness check, screen test, mobile test,
  breakpoint test, layout audit, contrast check, dark mode test, broken link check.
---

# Responsive Audit Skill

Perform a comprehensive responsive design audit on any web project. This skill
combines **source code analysis** with **live browser testing** to detect layout
issues, broken links, contrast failures, and accessibility problems across all
screen sizes and themes.

---

## Pre-Requisites

- **Node.js** (v18+) must be installed
- **Puppeteer** will be auto-installed via `npx` on first run (~170 MB Chromium download)
- The target app must be running and accessible via a URL

---

## How to Run

### Step 1 — Determine the Target URL

The user may provide the URL directly. If not, auto-detect:

1. Check for running dev servers on common ports: `3000`, `3001`, `4200`, `5173`,
   `5174`, `8000`, `8080`, `8888`, `4000`
2. Look at `package.json` scripts for port hints (e.g., `--port 8000`)
3. Scan running processes with `netstat -ano | findstr LISTENING` (Windows) or
   `lsof -i -P -n | grep LISTEN` (Mac/Linux)
4. If multiple or no servers are found, ask the user

> **The skill works with ANY URL and ANY port** — local, remote, staging, or production.

### Step 2 — Identify the Project Structure

Detect if the project is a monorepo or has mixed frontend/backend code:

1. Check for workspace configs: `pnpm-workspace.yaml`, `lerna.json`, root
   `package.json` with `"workspaces"`
2. Identify frontend directories: `src/`, `app/`, `pages/`, `components/`,
   `client/`, `frontend/`, `web/`, `packages/*/src/`
3. **Skip** backend/non-frontend: `server/`, `api/`, `backend/`, `node_modules/`,
   `dist/`, `build/`, `.next/`, `__pycache__/`, `venv/`, `.git/`
4. Only analyze frontend-relevant files: `*.html`, `*.css`, `*.scss`, `*.less`,
   `*.jsx`, `*.tsx`, `*.vue`, `*.svelte`, `*.astro`

### Step 3 — Execute the Audit Phases

Run each phase in order. If any phase fails, log the error and continue with the
remaining phases.

---

## Phase 0 — Pre-Flight Checklist

Before starting, verify:

- [ ] Target URL is reachable (HTTP 200)
- [ ] Page has a `<meta name="viewport">` tag
- [ ] Page loads without critical console errors
- [ ] Identify the tech stack (React, Vue, Next.js, static HTML, etc.)
- [ ] Detect if it's a SPA or MPA (affects route testing in Phase 3)
- [ ] Identify the project structure (monorepo vs single-package)

**How to check:**
- Use `curl` or the browser tool to fetch the URL
- Check the page source for `<meta name="viewport">`
- Look at `package.json` dependencies for framework detection

---

## Phase 1 — Code Analysis

Scan the frontend source files for responsive anti-patterns. Use `grep` to
search for these patterns:

| Check | Pattern to search | Severity |
|---|---|---|
| Missing viewport meta | No `<meta name="viewport"` in any HTML file | 🔴 Critical |
| Hardcoded pixel widths | `width:\s*\d+px` on containers/layouts (not icons/borders) | 🟡 Warning |
| Missing media queries | CSS files with no `@media` rules at all | 🟡 Warning |
| Fixed-position abuse | Count of `position:\s*fixed` (>3 is suspicious) | 🟡 Warning |
| Non-responsive images | `<img` without `max-width` or `srcset` nearby | 🟡 Warning |
| Pixel font sizes | `font-size:\s*\d+px` instead of `rem`/`em` | 🔵 Info |
| Hardcoded heights | `height:\s*\d+px` on content containers | 🟡 Warning |
| Tables without wrappers | `<table` without `overflow-x` or responsive class | 🟡 Warning |
| Hardcoded colors (no tokens) | `color:\s*#` without CSS variable usage | 🔵 Info |
| Missing dark-mode styles | Has `prefers-color-scheme: light` but no `dark` | 🟡 Warning |

**Commands to run for code analysis:**
```bash
# Search for hardcoded widths (excluding common small values)
grep -rn "width:\s*[2-9][0-9][0-9]\+px" --include="*.css" --include="*.scss" --include="*.less" .

# Search for missing media queries
find . -name "*.css" -o -name "*.scss" | xargs grep -L "@media"

# Search for pixel font sizes
grep -rn "font-size:\s*[0-9]\+px" --include="*.css" --include="*.scss" .

# Search for hardcoded colors
grep -rn "color:\s*#[0-9a-fA-F]" --include="*.css" --include="*.scss" .
```

---

## Phase 2 — Browser Testing (Per Breakpoint)

Run the Puppeteer script to test the live app at each breakpoint.

**Run the script:**
```bash
npx -y puppeteer@latest node "<path-to-skill>/scripts/responsive-audit.js" <url> --output <output-dir>
```

> Replace `<path-to-skill>` with the absolute path to this skill directory.
> Replace `<output-dir>` with a temporary directory for screenshots and the JSON report.

**Breakpoints tested:**

| Category | Width | Device Example |
|---|---|---|
| Mobile Small | 320px | iPhone SE |
| Mobile Medium | 375px | iPhone 12/13/14 |
| Mobile Large | 414px | iPhone Plus / Android |
| Tablet Portrait | 768px | iPad |
| Tablet Landscape | 1024px | iPad Landscape |
| Desktop | 1280px | Small laptop |
| Desktop Large | 1440px | Standard desktop |
| Desktop Full HD | 1920px | Full HD monitor |
| Ultra-Wide | 2560px | Ultra-wide / QHD |

**What the script checks at each breakpoint:**
- Horizontal overflow (scrollbar detection)
- Element overflow beyond viewport
- Overlapping elements (bounding-box intersection)
- Touch target sizes (< 44×44px)
- Font size minimum (< 12px)
- Text truncation detection
- Broken/oversized images
- Full-page screenshot capture

---

## Phase 3 — Multi-Page & Interactive Element Testing

If the app has multiple routes/pages:

1. **SPA**: Extract routes from the router config or navigation links on the page.
   Navigate to up to 5 main routes and run Phase 2 checks on each.
2. **MPA**: Follow internal `<a href>` links to discover pages.
3. **User-specified**: The user can provide specific routes to test.

Also check interactive elements at each breakpoint:
- **Navigation menu**: Does a hamburger menu appear on mobile? Full nav on desktop?
- **Modals/Dialogs**: Open any visible modal triggers, check responsiveness
- **Dropdowns**: Test positioning at small viewports
- **Forms**: Check layout, input sizes, label alignment
- **Tables**: Verify scroll/stack behavior on mobile
- **Sticky/Fixed elements**: Check if headers/footers cover content
- **Carousels**: Validate swipeable components adapt to viewport

---

## Phase 4 — Broken Link & URL Detection

**Source code scan** — Search project files for URLs:
```bash
# Find all URLs in source files
grep -rnoE "(https?://[^\s\"'>]+)" --include="*.html" --include="*.jsx" --include="*.tsx" --include="*.vue" --include="*.css" .

# Find empty hrefs
grep -rn 'href=""' --include="*.html" --include="*.jsx" --include="*.tsx" .

# Find localhost URLs in non-config files
grep -rn "localhost" --include="*.html" --include="*.jsx" --include="*.tsx" --include="*.css" .
```

**Live page scan** — The Puppeteer script also:
- Fetches all `<a href>` links and reports status codes
- Checks all `<img src>` images for broken loads
- Extracts `background-image: url(...)` and verifies them
- Validates favicon and social meta images (`og:image`, `twitter:image`)
- Verifies anchor fragments (`#section` → matching `id` exists)
- Captures network requests for API endpoint errors
- Reports redirect chains (3+ redirects)
- Validates `mailto:` and `tel:` link formats

---

## Phase 5 — Theme & Color Contrast Testing

The Puppeteer script tests the app in **both light and dark themes**.

**Theme detection priority:**
1. `prefers-color-scheme` media emulation via Puppeteer
2. CSS class toggle: `dark`, `theme-dark`, `dark-mode`, `[data-theme="dark"]`
3. Theme toggle button detection (common selectors)
4. User-specified method

**WCAG contrast checks in each theme:**

| Check | WCAG Standard | Severity |
|---|---|---|
| Normal text contrast | ≥ 4.5:1 (WCAG AA) | 🔴 Critical |
| Large text contrast (≥18px or ≥14px bold) | ≥ 3:1 (WCAG AA) | 🟡 Warning |
| UI component contrast (borders, inputs) | ≥ 3:1 (WCAG AA) | 🟡 Warning |
| Placeholder text contrast | ≥ 4.5:1 | 🟡 Warning |
| Link vs surrounding text | Distinguishable (≥ 3:1 or underlined) | 🟡 Warning |
| Focus indicator contrast | ≥ 3:1 against adjacent colors | 🟡 Warning |

**Code analysis for themes:**
- Hardcoded colors without CSS variables
- Missing dark-mode counterpart styles
- Inconsistent theming (mixed variables and hardcoded)
- Opacity-based theming instead of proper color tokens

---

## Phase 6 — Accessibility at Each Breakpoint

| Check | Threshold | Severity |
|---|---|---|
| Font size minimum | ≥ 12px | 🟡 Warning |
| Touch targets | ≥ 44 × 44px | 🟡 Warning |
| Focus indicators | Visible focus ring on tab-through | 🟡 Warning |
| Content reflow | No loss of info when zoomed to 200% | 🔴 Critical |
| Orientation support | Content works in both portrait & landscape | 🔵 Info |

---

## Phase 7 — Report Generation

After all phases complete, generate a Markdown report artifact using the template
at [report-template.md](./resources/report-template.md).

**The report includes:**
1. Executive summary with pass/fail counts and overall score
2. Pre-flight results
3. Code analysis findings table
4. Per-breakpoint screenshot carousel with issues
5. Theme & contrast comparison (light vs dark side-by-side)
6. Broken link report table
7. Accessibility findings
8. Prioritized recommendations with fix code snippets

**Parse the JSON report** from the Puppeteer script output at `{output-dir}/audit-report.json`
and merge it with the code analysis findings to create the final report.

Each issue in the report must include:
- **Severity** (🔴 Critical / 🟡 Warning / 🔵 Info)
- **Theme** (Light / Dark / Both)
- **Breakpoint** where it occurs
- **Element selector** (CSS path)
- **Contrast ratio** (if applicable)
- **Suggested fix** with code snippet

---

## Edge Cases

- **No dark mode**: If the app has no dark mode support, skip Phase 5 theme
  toggling and note it in the report
- **Monorepo**: Code analysis scans only frontend packages
- **CSS-in-JS**: Code analysis may not find inline styles; browser testing covers this
- **Auth-protected pages**: Skip with info note
- **Self-signed HTTPS**: Use `--ignore-https-errors` in Puppeteer
- **Rate-limited external URLs**: Respect rate limits, report as Info
- **No running server**: Ask the user to start their dev server first
