# 📊 Responsive Audit Report

> **URL**: {{url}}
> **Audited**: {{timestamp}}
> **Tech Stack**: {{techStack}}
> **Project Type**: {{projectType}}

---

## Executive Summary

| Metric | Count |
|---|---|
| ✅ Passed | {{passed}} |
| 🔴 Critical | {{critical}} |
| 🟡 Warning | {{warnings}} |
| 🔵 Info | {{info}} |
| **Total Checks** | **{{totalChecks}}** |

**Overall Score**: {{score}}/100

> [!{{summaryAlert}}]
> {{summaryMessage}}

---

## Pre-Flight Results

| Check | Status | Details |
|---|---|---|
| URL Reachable | {{urlReachable}} | {{urlDetails}} |
| Viewport Meta Tag | {{viewportMeta}} | {{viewportDetails}} |
| Console Errors | {{consoleErrors}} | {{consoleDetails}} |
| Tech Stack | {{techStack}} | Detected from dependencies |
| App Type | {{appType}} | SPA / MPA |
| Project Structure | {{projectStructure}} | Single / Monorepo |

---

## Code Analysis Findings

| Severity | Check | File | Line | Details | Suggested Fix |
|---|---|---|---|---|---|
{{#codeIssues}}
| {{severity}} | {{check}} | [{{file}}](file:///{{filePath}}) | L{{line}} | {{details}} | {{fix}} |
{{/codeIssues}}

{{#noCodeIssues}}
> [!TIP]
> No responsive anti-patterns found in source code. Great job! 🎉
{{/noCodeIssues}}

---

## Per-Breakpoint Results

{{#breakpoints}}
### {{category}} — {{width}}px ({{device}})

````carousel
#### 🌞 Light Theme
![{{category}} Light — {{width}}px]({{lightScreenshot}})

**Issues**: {{lightIssueCount}} | **Passed**: {{lightPassCount}}
<!-- slide -->
#### 🌙 Dark Theme
![{{category}} Dark — {{width}}px]({{darkScreenshot}})

**Issues**: {{darkIssueCount}} | **Passed**: {{darkPassCount}}
````

{{#hasIssues}}
| Severity | Issue | Element | Details | Fix |
|---|---|---|---|---|
{{#issues}}
| {{severity}} | {{type}} | `{{element}}` | {{description}} | {{suggestion}} |
{{/issues}}
{{/hasIssues}}

{{#noIssues}}
> ✅ All checks passed at this breakpoint
{{/noIssues}}

---

{{/breakpoints}}

## 🌞🌙 Theme & Contrast Report

### Contrast Summary

| Theme | Elements Checked | Passed | Failed | Pass Rate |
|---|---|---|---|---|
| 🌞 Light | {{lightContrastTotal}} | {{lightContrastPassed}} | {{lightContrastFailed}} | {{lightContrastRate}}% |
| 🌙 Dark | {{darkContrastTotal}} | {{darkContrastPassed}} | {{darkContrastFailed}} | {{darkContrastRate}}% |

### Contrast Issues

{{#contrastIssues}}
| Theme | Element | Text Sample | Foreground | Background | Ratio | Required | Severity | Fix |
|---|---|---|---|---|---|---|---|---|
| {{theme}} | `{{element}}` | "{{text}}" | `{{foreground}}` | `{{background}}` | {{ratio}}:1 | {{required}}:1 | {{severity}} | {{suggestion}} |
{{/contrastIssues}}

{{#noContrastIssues}}
> [!TIP]
> All text elements meet WCAG AA contrast requirements in both themes. 🎉
{{/noContrastIssues}}

### Theme-Specific Findings

{{#themeFindings}}
| Finding | Details |
|---|---|
{{#findings}}
| {{check}} | {{details}} |
{{/findings}}
{{/themeFindings}}

---

## 🔗 Broken Link Report

### Link Summary

| Type | Total | OK (2xx) | Broken (4xx/5xx) | Timeout | Other |
|---|---|---|---|---|---|
| Internal Links | {{internalTotal}} | {{internalOk}} | {{internalBroken}} | {{internalTimeout}} | {{internalOther}} |
| External Links | {{externalTotal}} | {{externalOk}} | {{externalBroken}} | {{externalTimeout}} | {{externalOther}} |
| Images/Assets | {{assetTotal}} | {{assetOk}} | {{assetBroken}} | {{assetTimeout}} | {{assetOther}} |
| Anchor Fragments | {{anchorTotal}} | {{anchorOk}} | {{anchorBroken}} | — | — |

### Broken Links Detail

{{#linkIssues}}
| Severity | URL | Status | Found In | Type | Fix |
|---|---|---|---|---|---|
| {{severity}} | `{{url}}` | {{status}} | {{foundIn}} | {{type}} | {{suggestion}} |
{{/linkIssues}}

{{#noLinkIssues}}
> [!TIP]
> All links and assets are working correctly. 🎉
{{/noLinkIssues}}

### Warnings

{{#linkWarnings}}
| Warning | URL | Details |
|---|---|---|
{{#warnings}}
| {{type}} | `{{url}}` | {{details}} |
{{/warnings}}
{{/linkWarnings}}

---

## Accessibility Findings

| Breakpoint | Check | Severity | Element | Details | Fix |
|---|---|---|---|---|---|
{{#accessibilityIssues}}
| {{breakpoint}} | {{check}} | {{severity}} | `{{element}}` | {{details}} | {{fix}} |
{{/accessibilityIssues}}

{{#noAccessibilityIssues}}
> [!TIP]
> All accessibility checks passed across all breakpoints. 🎉
{{/noAccessibilityIssues}}

---

## Recommendations & Fix Priority

### 🔴 Critical — Fix Immediately

{{#criticalFixes}}
1. **{{title}}**
   - **Where**: {{location}}
   - **Impact**: {{impact}}
   - **Fix**:
   ```{{lang}}
   {{code}}
   ```
{{/criticalFixes}}

### 🟡 Warning — Fix Soon

{{#warningFixes}}
1. **{{title}}**
   - **Where**: {{location}}
   - **Impact**: {{impact}}
   - **Fix**:
   ```{{lang}}
   {{code}}
   ```
{{/warningFixes}}

### 🔵 Info — Consider Improving

{{#infoFixes}}
1. **{{title}}** — {{details}}
{{/infoFixes}}

---

## Test Configuration

| Setting | Value |
|---|---|
| Breakpoints Tested | {{breakpointsList}} |
| Pages Tested | {{pagesList}} |
| Theme Testing | {{themeMode}} |
| Link Checking | {{linkChecking}} |
| External Links | {{externalLinks}} |
| Timeout | {{timeout}}ms |

---

*Report generated by the responsive-audit skill*
