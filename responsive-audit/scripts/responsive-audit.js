#!/usr/bin/env node
/**
 * Responsive Design Auditor
 * A comprehensive Puppeteer script to automatically audit web pages for responsive design,
 * accessibility (contrast), layout issues, and broken links across multiple viewports and themes.
 */

const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');
const urlModule = require('url');

// --- ANSI Colors for CLI ---
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// --- Default Configuration ---
const DEFAULT_CONFIG = {
  breakpoints: [320, 375, 414, 768, 1024, 1280, 1440, 1920, 2560],
  pages: ['/'],
  output: './audit-report',
  fullPage: true,
  theme: 'both',       // 'light' | 'dark' | 'both'
  themeMethod: 'auto', // 'media' | 'class:dark' | 'attr:data-theme=dark' | 'auto'
  checkLinks: true,
  externalLinks: false,
  timeout: 30000
};

// --- CLI Parsing ---
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const config = { ...DEFAULT_CONFIG, targetUrl: args[0] };

  try {
    new URL(config.targetUrl);
  } catch (e) {
    console.error(`${colors.red}Error: Invalid target URL "${config.targetUrl}"${colors.reset}`);
    process.exit(1);
  }

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--breakpoints') {
      config.breakpoints = args[++i].split(',').map(Number).filter(n => !isNaN(n));
    } else if (arg === '--pages') {
      config.pages = args[++i].split(',').map(p => p.trim());
    } else if (arg === '--output') {
      config.output = args[++i];
    } else if (arg === '--full-page') {
      config.fullPage = args[++i] !== 'false';
    } else if (arg === '--theme') {
      config.theme = args[++i];
    } else if (arg === '--theme-method') {
      config.themeMethod = args[++i];
    } else if (arg === '--check-links') {
      config.checkLinks = args[++i] !== 'false';
    } else if (arg === '--external-links') {
      config.externalLinks = args[++i] === 'true' || args[i] === undefined || args[i].startsWith('--') ? true : args[i] === 'true';
      if (args[i] !== undefined && args[i].startsWith('--')) i--; 
    } else if (arg === '--timeout') {
      config.timeout = parseInt(args[++i], 10) || 30000;
    }
  }

  return config;
}

function printUsage() {
  console.log(`
${colors.bold}Responsive Design Auditor${colors.reset}

${colors.bold}Usage:${colors.reset} node responsive-audit.js <url> [options]

${colors.bold}Arguments:${colors.reset}
  url                    Target URL to audit (e.g., https://example.com)

${colors.bold}Options:${colors.reset}
  --breakpoints <list>   Comma-separated widths (default: 320,375,414,768,1024,1280,1440,1920,2560)
  --pages <list>         Comma-separated paths to test (default: /)
  --output <dir>         Output directory for screenshots and JSON report (default: ./audit-report)
  --full-page            Take full-page screenshots (default: true)
  --theme <mode>         Theme to test: "both" | "light" | "dark" (default: both)
  --theme-method <how>   How to toggle dark mode: "media" | "class:dark" | "attr:data-theme=dark" | "auto" (default: auto)
  --check-links          Check all links for broken URLs (default: true)
  --external-links       Also check external URLs, not just internal (default: false)
  --timeout <ms>         Page load timeout (default: 30000)
`);
}

// --- Device/Viewport Mapping ---
function getDeviceName(width) {
  if (width <= 320) return 'Mobile Small (iPhone SE)';
  if (width <= 375) return 'Mobile Medium (iPhone 11/12/13)';
  if (width <= 428) return 'Mobile Large (iPhone Max)';
  if (width <= 768) return 'Tablet (iPad Mini/Air)';
  if (width <= 1024) return 'Tablet/Laptop Small (iPad Pro)';
  if (width <= 1440) return 'Laptop/Desktop';
  return 'Large Desktop';
}

// --- Utility Functions ---
async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

// --- Browser Execution Scripts ---
// The following functions are executed INSIDE the Puppeteer page context.

const layoutCheckScript = `() => {
  const issues = [];
  const report = (type, severity, description, element, details, suggestion) => {
    issues.push({ type, severity, description, element, details, suggestion });
  };

  // 1. Check Horizontal Overflow
  const docScrollWidth = document.documentElement.scrollWidth;
  const docClientWidth = document.documentElement.clientWidth;
  if (docScrollWidth > docClientWidth) {
    report(
      'horizontal-overflow',
      'critical',
      'The page has horizontal scrolling.',
      'html',
      { scrollWidth: docScrollWidth, clientWidth: docClientWidth },
      'Check for elements with a fixed width larger than 100vw or missing max-width: 100%.'
    );
    
    // Find culprit elements
    const allElements = document.querySelectorAll('body *');
    for (const el of allElements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > docClientWidth && rect.width > 0) {
        report('overflow-culprit', 'warning', 'Element overflows viewport horizontally.', 
               el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : ''),
               { rectRight: rect.right, viewportWidth: docClientWidth },
               'Use max-width: 100% or overflow-wrap: break-word.'
        );
      }
    }
  }

  // 2. Check Touch Targets
  const touchTargets = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"]');
  touchTargets.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return; // Hidden
    if (rect.width < 44 || rect.height < 44) {
      report(
        'small-touch-target',
        'warning',
        'Interactive element is smaller than 44x44px (WCAG minimum).',
        el.outerHTML.substring(0, 100),
        { width: rect.width, height: rect.height },
        'Increase padding or min-width/min-height to at least 44px.'
      );
    }
  });

  // 3. Minimum Font Size & Truncation
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const tag = node.tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'meta', 'link'].includes(tag)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let node;
  while ((node = walker.nextNode())) {
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
    
    // Font size check
    if (node.childNodes.length > 0) {
      let hasText = false;
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
          hasText = true; break;
        }
      }
      
      if (hasText) {
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 12) {
          report(
            'small-font-size',
            'warning',
            'Font size is smaller than 12px, which may be hard to read.',
            node.outerHTML.substring(0, 100),
            { fontSize },
            'Increase font-size to at least 12px (16px is recommended for body text).'
          );
        }
      }
    }

    // Truncation check
    if (style.overflow === 'hidden' && style.textOverflow === 'ellipsis') {
      if (node.scrollWidth > node.clientWidth) {
        report(
          'text-truncation',
          'info',
          'Text is truncated with an ellipsis.',
          node.outerHTML.substring(0, 100),
          { scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, text: node.textContent.trim().substring(0, 30) },
          'Ensure truncated text is accessible (e.g., via title attribute or tooltip).'
        );
      }
    }
  }

  // 4. Broken or Oversized Images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete && img.naturalWidth === 0) {
      report(
        'broken-image',
        'critical',
        'Image failed to load or is broken.',
        img.outerHTML.substring(0, 100),
        { src: img.src },
        'Verify the image URL and ensure the asset exists.'
      );
    } else {
      const rect = img.getBoundingClientRect();
      if (rect.width > docClientWidth) {
        report(
          'oversized-image',
          'warning',
          'Image is wider than the viewport.',
          img.outerHTML.substring(0, 100),
          { imgWidth: rect.width, viewportWidth: docClientWidth },
          'Add max-width: 100% to the image.'
        );
      }
    }
  });

  return issues;
}`;

const contrastCheckScript = `() => {
  const issues = [];

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrast(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function parseRGB(rgbStr) {
    const match = rgbStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (!match) return null;
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }

  function getEffectiveBackgroundColor(el) {
    let bg = window.getComputedStyle(el).backgroundColor;
    while ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && el.parentElement) {
      el = el.parentElement;
      bg = window.getComputedStyle(el).backgroundColor;
    }
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
      return 'rgb(255, 255, 255)'; // Assume white background if none found
    }
    return bg;
  }

  const elements = document.querySelectorAll('body *');
  elements.forEach(node => {
    // Only check elements with direct text nodes
    let hasText = false;
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
        hasText = true; break;
      }
    }
    
    if (!hasText) return;

    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

    const colorStr = style.color;
    const bgStr = getEffectiveBackgroundColor(node);

    const fgRGB = parseRGB(colorStr);
    const bgRGB = parseRGB(bgStr);

    if (!fgRGB || !bgRGB) return;

    const fgLum = getLuminance(fgRGB[0], fgRGB[1], fgRGB[2]);
    const bgLum = getLuminance(bgRGB[0], bgRGB[1], bgRGB[2]);
    
    const ratio = getContrast(fgLum, bgLum);
    
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    const isLarge = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
    
    const requiredRatio = isLarge ? 3.0 : 4.5;

    if (ratio < requiredRatio) {
      issues.push({
        element: node.tagName.toLowerCase() + (node.className ? '.' + node.className.split(' ').join('.') : ''),
        text: node.textContent.trim().substring(0, 30),
        foreground: colorStr,
        background: bgStr,
        ratio: Math.round(ratio * 100) / 100,
        required: requiredRatio,
        severity: 'warning',
        suggestion: \`Increase contrast to at least \${requiredRatio}:1 (Currently \${Math.round(ratio*100)/100}:1)\`
      });
    }
  });

  return issues;
}`;

const extractLinksScript = `() => {
  const links = [];
  
  document.querySelectorAll('a[href]').forEach(a => {
    links.push({ type: 'anchor', url: a.href, raw: a.getAttribute('href'), element: a.outerHTML.substring(0,100) });
  });
  
  document.querySelectorAll('img[src]').forEach(img => {
    links.push({ type: 'image', url: img.src, raw: img.getAttribute('src'), element: img.outerHTML.substring(0,100) });
  });
  
  document.querySelectorAll('link[href]').forEach(link => {
    links.push({ type: 'stylesheet', url: link.href, raw: link.getAttribute('href'), element: link.outerHTML.substring(0,100) });
  });

  document.querySelectorAll('script[src]').forEach(script => {
    links.push({ type: 'script', url: script.src, raw: script.getAttribute('src'), element: script.outerHTML.substring(0,100) });
  });

  return links;
}`;

const toggleThemeScript = `async (theme, method) => {
  if (method === 'auto') {
    // Try data attribute
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', theme);
    document.documentElement.setAttribute('color-scheme', theme);
    
    // Try classes
    document.documentElement.classList.remove('light', 'dark', 'theme-light', 'theme-dark', 'dark-mode');
    document.documentElement.classList.add(theme === 'dark' ? 'dark' : 'light');
    document.body.classList.remove('light', 'dark', 'theme-light', 'theme-dark', 'dark-mode');
    document.body.classList.add(theme === 'dark' ? 'dark' : 'light');
    
    // Try to find a theme toggle button and click it if state doesn't match
    // Note: This is heuristic and might not work for all sites, media query is usually better.
  } else if (method.startsWith('class:')) {
    const cls = method.split(':')[1];
    if (theme === 'dark') {
      document.documentElement.classList.add(cls);
    } else {
      document.documentElement.classList.remove(cls);
    }
  } else if (method.startsWith('attr:')) {
    const parts = method.split(':')[1].split('=');
    const attr = parts[0];
    const darkVal = parts[1] || 'dark';
    if (theme === 'dark') {
      document.documentElement.setAttribute(attr, darkVal);
    } else {
      document.documentElement.setAttribute(attr, 'light'); // Or remove
    }
  }
}`;

// --- Main Engine ---
async function runAudit() {
  const config = parseArgs();
  const report = {
    url: config.targetUrl,
    timestamp: new Date().toISOString(),
    summary: { totalChecks: 0, critical: 0, warnings: 0, info: 0, passed: 0 },
    breakpoints: [],
    contrastIssues: [],
    linkIssues: []
  };

  console.log(`${colors.cyan}Starting Audit for ${colors.bold}${config.targetUrl}${colors.reset}`);
  console.log(`${colors.gray}Config: Breakpoints [${config.breakpoints.join(', ')}], Pages [${config.pages.join(', ')}], Theme: ${config.theme}${colors.reset}\n`);

  await ensureDir(config.output);
  const screenshotsDir = path.join(config.output, 'screenshots');
  await ensureDir(screenshotsDir);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const baseUrl = new URL(config.targetUrl).origin;

    for (const pagePath of config.pages) {
      const fullUrl = new URL(pagePath, baseUrl).toString();
      console.log(`${colors.blue}▶ Auditing Page: ${fullUrl}${colors.reset}`);

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(config.timeout);

      // Collect links first on desktop viewport to avoid mobile menus hiding things
      await page.setViewport({ width: 1440, height: 900 });
      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle2' });
      } catch (err) {
        console.error(`${colors.red}Failed to load ${fullUrl}: ${err.message}${colors.reset}`);
        continue;
      }

      // Link Checking
      if (config.checkLinks) {
        console.log(`  ${colors.gray}Checking links...${colors.reset}`);
        const extractedLinks = await page.evaluate(extractLinksScript);
        await performLinkAnalysis(extractedLinks, fullUrl, config, report, page);
      }

      const themesToTest = config.theme === 'both' ? ['light', 'dark'] : [config.theme];

      for (const theme of themesToTest) {
        console.log(`  ${colors.magenta}Theme: ${theme}${colors.reset}`);
        
        // Apply theme
        if (config.themeMethod === 'media' || config.themeMethod === 'auto') {
          await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
        }
        await page.evaluate(toggleThemeScript, theme, config.themeMethod);
        
        // Wait for potential transitions
        await new Promise(r => setTimeout(r, 500));

        // Contrast Check
        console.log(`    ${colors.gray}Running Contrast Checks...${colors.reset}`);
        const contrastIssues = await page.evaluate(contrastCheckScript);
        contrastIssues.forEach(issue => {
          issue.theme = theme;
          issue.page = pagePath;
          report.contrastIssues.push(issue);
          updateSummary(report, issue.severity);
        });
        report.summary.totalChecks += contrastIssues.length;

        // Viewport Testing
        for (const width of config.breakpoints) {
          const bpReport = {
            page: pagePath,
            width,
            category: getDeviceName(width),
            theme,
            screenshots: {},
            issues: []
          };

          console.log(`    ${colors.cyan}Breakpoint: ${width}px (${bpReport.category})${colors.reset}`);
          await page.setViewport({ width, height: 900 });
          
          // Wait briefly for layout shifts
          await new Promise(r => setTimeout(r, 500));

          // Run Layout Checks
          const layoutIssues = await page.evaluate(layoutCheckScript);
          bpReport.issues.push(...layoutIssues);
          layoutIssues.forEach(i => updateSummary(report, i.severity));
          report.summary.totalChecks += layoutIssues.length || 1; 
          if (layoutIssues.length === 0) report.summary.passed++;

          // Screenshot
          const safePathName = pagePath === '/' ? 'home' : pagePath.replace(/[^a-z0-9]/gi, '_');
          const screenshotFileName = `${safePathName}_${width}px_${theme}.png`;
          const screenshotPath = path.join(screenshotsDir, screenshotFileName);
          
          await page.screenshot({ path: screenshotPath, fullPage: config.fullPage });
          bpReport.screenshots[theme] = `screenshots/${screenshotFileName}`;

          report.breakpoints.push(bpReport);
        }
      }
      await page.close();
    }

  } catch (error) {
    console.error(`${colors.red}Fatal Error during audit: ${error.stack}${colors.reset}`);
  } finally {
    await browser.close();
  }

  // Generate Report
  const reportPath = path.join(config.output, 'audit-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  printSummary(report, reportPath);

  if (report.summary.critical > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// --- Link Analysis ---
async function performLinkAnalysis(links, baseUrl, config, report, page) {
  const baseHostname = new URL(baseUrl).hostname;
  
  // Deduplicate
  const uniqueLinks = new Map();
  links.forEach(l => {
    if (!l.url) return;
    if (!uniqueLinks.has(l.url)) {
      uniqueLinks.set(l.url, l);
    }
  });

  let checkedCount = 0;

  for (const [linkUrl, linkData] of uniqueLinks.entries()) {
    report.summary.totalChecks++;
    
    // Check for empty/missing raw href
    if (!linkData.raw || linkData.raw.trim() === '') {
      report.linkIssues.push({
        url: linkUrl,
        foundIn: linkData.element,
        status: null,
        severity: 'warning',
        type: 'empty-href',
        suggestion: 'Provide a valid URL for the href/src attribute.'
      });
      updateSummary(report, 'warning');
      continue;
    }

    // Check for http instead of https
    if (linkData.raw.startsWith('http://') && !linkData.raw.includes('localhost')) {
      report.linkIssues.push({
        url: linkUrl,
        foundIn: linkData.element,
        status: null,
        severity: 'warning',
        type: 'insecure-http',
        suggestion: 'Upgrade link to https://.'
      });
      updateSummary(report, 'warning');
    }

    // Anchor check
    if (linkData.raw.startsWith('#')) {
      const id = linkData.raw.substring(1);
      if (id) {
        const exists = await page.evaluate((targetId) => !!document.getElementById(targetId), id);
        if (!exists) {
          report.linkIssues.push({
            url: linkData.raw,
            foundIn: linkData.element,
            status: null,
            severity: 'warning',
            type: 'broken-anchor',
            suggestion: `Ensure an element with id="${id}" exists on the page.`
          });
          updateSummary(report, 'warning');
        } else {
          report.summary.passed++;
        }
      }
      continue;
    }

    // Determine if external
    let isExternal = false;
    try {
      const u = new URL(linkUrl);
      if (u.hostname !== baseHostname) isExternal = true;
    } catch(e) {
      continue; // Invalid URL format (e.g. javascript:void(0))
    }

    if (isExternal && !config.externalLinks) {
      continue;
    }

    // HTTP Request to check status
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for links
      
      const res = await fetch(linkUrl, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Responsive-Audit-Bot/1.0' }
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        report.linkIssues.push({
          url: linkUrl,
          foundIn: linkData.element,
          status: res.status,
          severity: res.status >= 500 ? 'critical' : (res.status === 404 ? 'critical' : 'warning'),
          type: linkData.type === 'image' ? 'broken-image' : 'dead-link',
          suggestion: `Link returned status ${res.status}. Verify the destination.`
        });
        updateSummary(report, res.status >= 500 || res.status === 404 ? 'critical' : 'warning');
      } else {
        report.summary.passed++;
      }
    } catch (err) {
      report.linkIssues.push({
        url: linkUrl,
        foundIn: linkData.element,
        status: null,
        severity: 'warning',
        type: 'fetch-failed',
        suggestion: `Network error or timeout: ${err.message}`
      });
      updateSummary(report, 'warning');
    }
    
    checkedCount++;
    if (checkedCount % 10 === 0) {
      process.stdout.write('.');
    }
  }
  if (checkedCount > 0) console.log(); // newline after progress dots
}

function updateSummary(report, severity) {
  if (severity === 'critical') report.summary.critical++;
  else if (severity === 'warning') report.summary.warnings++;
  else if (severity === 'info') report.summary.info++;
}

// --- Output Formatting ---
function printSummary(report, reportPath) {
  console.log(`\n${colors.bold}=== Audit Summary ===${colors.reset}`);
  console.log(`Target URL : ${report.url}`);
  console.log(`Report JSON: ${reportPath}`);
  
  console.log(`\n${colors.bold}Issues Breakdown:${colors.reset}`);
  console.log(`  Total Checks : ${report.summary.totalChecks}`);
  console.log(`  Passed       : ${colors.green}${report.summary.passed}${colors.reset}`);
  console.log(`  Critical     : ${report.summary.critical > 0 ? colors.red + report.summary.critical + colors.reset : '0'}`);
  console.log(`  Warnings     : ${report.summary.warnings > 0 ? colors.yellow + report.summary.warnings + colors.reset : '0'}`);
  console.log(`  Info         : ${colors.blue}${report.summary.info}${colors.reset}`);
  
  const layoutIssuesCount = report.breakpoints.reduce((sum, bp) => sum + bp.issues.length, 0);
  console.log(`\n${colors.bold}Categories:${colors.reset}`);
  console.log(`  Layout/Viewport : ${layoutIssuesCount} issues found`);
  console.log(`  Contrast/A11y   : ${report.contrastIssues.length} issues found`);
  console.log(`  Links/Assets    : ${report.linkIssues.length} issues found`);

  if (report.summary.critical > 0) {
    console.log(`\n${colors.bgRed}${colors.white} AUDIT FAILED ${colors.reset} - Found critical issues.`);
  } else if (report.summary.warnings > 0) {
    console.log(`\n${colors.bgYellow}${colors.white} AUDIT PASSED WITH WARNINGS ${colors.reset}`);
  } else {
    console.log(`\n${colors.bgGreen}${colors.white} AUDIT PASSED ${colors.reset}`);
  }
}

// --- Execution ---
runAudit();
