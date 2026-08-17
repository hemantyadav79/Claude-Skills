# Breakpoint Reference Guide

Comprehensive reference for responsive breakpoints, common device dimensions,
and CSS media query patterns.

---

## Standard Breakpoints

| Category | Width | Height | Device Examples | CSS Media Query |
|---|---|---|---|---|
| **Mobile Small** | 320px | 568px | iPhone SE, iPhone 5/5S | `@media (max-width: 320px)` |
| **Mobile Medium** | 375px | 667px | iPhone 12/13/14, iPhone X | `@media (max-width: 375px)` |
| **Mobile Large** | 414px | 896px | iPhone Plus, Pixel 5, Galaxy S21 | `@media (max-width: 414px)` |
| **Tablet Portrait** | 768px | 1024px | iPad, iPad Mini, Galaxy Tab | `@media (max-width: 768px)` |
| **Tablet Landscape** | 1024px | 768px | iPad Landscape, iPad Air | `@media (max-width: 1024px)` |
| **Desktop** | 1280px | 800px | Small laptops, MacBook Air 13" | `@media (max-width: 1280px)` |
| **Desktop Large** | 1440px | 900px | Standard desktop, MacBook Pro 15" | `@media (max-width: 1440px)` |
| **Desktop Full HD** | 1920px | 1080px | Full HD monitors | `@media (max-width: 1920px)` |
| **Ultra-Wide** | 2560px | 1440px | QHD monitors, ultra-wide displays | `@media (max-width: 2560px)` |

---

## Common Device Dimensions

### Phones

| Device | Viewport Width | Viewport Height | Pixel Ratio |
|---|---|---|---|
| iPhone SE (3rd gen) | 375px | 667px | 2x |
| iPhone 12 Mini | 375px | 812px | 3x |
| iPhone 12/13/14 | 390px | 844px | 3x |
| iPhone 12/13/14 Pro Max | 428px | 926px | 3x |
| iPhone 15 Pro | 393px | 852px | 3x |
| iPhone 15 Pro Max | 430px | 932px | 3x |
| Samsung Galaxy S21 | 360px | 800px | 3x |
| Samsung Galaxy S23 Ultra | 384px | 854px | 3x |
| Google Pixel 7 | 412px | 915px | 2.625x |
| Google Pixel 8 Pro | 448px | 998px | 2.625x |

### Tablets

| Device | Portrait Width | Landscape Width | Pixel Ratio |
|---|---|---|---|
| iPad Mini (6th gen) | 744px | 1133px | 2x |
| iPad (10th gen) | 820px | 1180px | 2x |
| iPad Air (5th gen) | 820px | 1180px | 2x |
| iPad Pro 11" | 834px | 1194px | 2x |
| iPad Pro 12.9" | 1024px | 1366px | 2x |
| Samsung Galaxy Tab S8 | 800px | 1280px | 2x |
| Surface Pro 8 | 912px | 1368px | 2x |

### Desktops & Laptops

| Category | Common Widths |
|---|---|
| Small Laptop | 1280px, 1366px |
| Standard Desktop | 1440px, 1536px |
| Full HD | 1920px |
| QHD | 2560px |
| 4K | 3840px |
| Ultra-Wide | 3440px, 5120px |

---

## CSS Media Query Patterns

### Mobile-First (Recommended)

```css
/* Base styles for mobile (320px+) */
.container { padding: 1rem; }

/* Larger phones */
@media (min-width: 375px) {
  .container { padding: 1.25rem; }
}

/* Tablets */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 3rem; max-width: 1200px; }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .container { max-width: 1400px; }
}

/* Ultra-Wide */
@media (min-width: 2560px) {
  .container { max-width: 1800px; }
}
```

### Desktop-First

```css
/* Base styles for desktop */
.container { max-width: 1200px; padding: 3rem; }

/* Tablet */
@media (max-width: 1024px) {
  .container { padding: 2rem; }
}

/* Mobile */
@media (max-width: 768px) {
  .container { padding: 1rem; max-width: 100%; }
}
```

### Orientation Queries

```css
@media (orientation: portrait) {
  /* Portrait-specific styles */
}

@media (orientation: landscape) {
  /* Landscape-specific styles */
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a2e;
    --text-color: #e0e0e0;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --bg-color: #ffffff;
    --text-color: #1a1a2e;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## WCAG Contrast Ratio Reference

| Text Type | Minimum Ratio (AA) | Enhanced Ratio (AAA) |
|---|---|---|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px or ≥ 14px bold) | 3:1 | 4.5:1 |
| UI Components & Graphics | 3:1 | N/A |
| Incidental/Decorative | No requirement | No requirement |

### Contrast Ratio Formula

```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
(where R, G, B are linearized: if sRGB <= 0.04045: linear = sRGB/12.92, else: ((sRGB+0.055)/1.055)^2.4)

Contrast Ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

---

## Touch Target Sizing

| Standard | Minimum Size | Recommended Size |
|---|---|---|
| WCAG 2.1 (AA) | 44 × 44 px | 48 × 48 px |
| Material Design | 48 × 48 dp | 48 × 48 dp |
| Apple HIG | 44 × 44 pt | 44 × 44 pt |
| Spacing between targets | 8px minimum | 12px recommended |
