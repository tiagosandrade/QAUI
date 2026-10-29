/**
 * QAUI — Universal Surface Health Auditor
 * Evaluates any web page (React, Next, Vue, Angular, PHP, .NET, static, external URLs)
 * for broken assets, HTTP >= 400 resources, layout overflow, accessibility gaps, and Web Vitals.
 * License: MIT
 */
(() => {
  function runSurfaceAudit() {
    const docEl = document.documentElement;
    const vw = window.innerWidth || docEl.clientWidth || 0;
    const vh = window.innerHeight || docEl.clientHeight || 0;

    // 1. Broken visible images
    const brokenImages = Array.from(document.querySelectorAll('img'))
      .filter((img) => {
        const style = window.getComputedStyle(img);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const src = img.getAttribute('src') || '';
        if (!src) return true;
        return img.complete && img.naturalWidth === 0;
      })
      .slice(0, 20)
      .map((img) => ({
        src: img.currentSrc || img.getAttribute('src') || '(empty src)',
        alt: img.getAttribute('alt') ?? '(missing alt)',
      }));

    // 2. Network resource failures & slow assets (PerformanceResourceTiming)
    const resources = performance.getEntriesByType ? performance.getEntriesByType('resource') : [];
    const failedResources = [];
    const slowResources = [];

    for (const r of resources) {
      if (typeof r.responseStatus === 'number' && r.responseStatus >= 400) {
        failedResources.push({
          name: r.name.slice(0, 140),
          initiatorType: r.initiatorType,
          status: r.responseStatus,
        });
      }
      if (r.duration > 3000) {
        slowResources.push({
          name: r.name.slice(0, 140),
          initiatorType: r.initiatorType,
          durationMs: Math.round(r.duration),
        });
      }
    }

    // 3. Layout horizontal overflow check (broken responsive CSS)
    const scrollWidth = docEl.scrollWidth || 0;
    const hasHorizontalOverflow = scrollWidth > vw + 6;

    // 4. Interactive controls without accessible names (Buttons, Links, Inputs)
    const unlabeledControls = [];
    const controls = document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea');
    for (const el of controls) {
      if (unlabeledControls.length >= 20) break;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const labelId = el.getAttribute('aria-labelledby');
      const labelledByText = labelId
        ? labelId
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.innerText || '')
            .join(' ')
            .trim()
        : '';
      const explicitLabel = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.innerText || '' : '';
      const wrappedLabel = el.closest('label')?.innerText || '';
      const imgAlt = el.querySelector('img[alt]')?.getAttribute('alt') || '';

      const accessibleName = (
        el.innerText ||
        el.getAttribute('aria-label') ||
        labelledByText ||
        explicitLabel ||
        wrappedLabel ||
        el.getAttribute('placeholder') ||
        el.getAttribute('title') ||
        el.getAttribute('value') ||
        imgAlt ||
        ''
      ).trim();

      if (!accessibleName) {
        unlabeledControls.push({
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || undefined,
          id: el.id || undefined,
          className: String(el.className || '').slice(0, 60) || undefined,
        });
      }
    }

    // 5. Dead / empty anchor links
    const deadLinks = Array.from(document.querySelectorAll('a'))
      .filter((a) => {
        const rect = a.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const href = (a.getAttribute('href') || '').trim();
        const role = a.getAttribute('role');
        return (!href || href === '#' || href.toLowerCase() === 'javascript:void(0)') && role !== 'button';
      })
      .slice(0, 15)
      .map((a) => ({
        text: (a.innerText || '').trim().slice(0, 50) || '(icon/empty)',
        href: a.getAttribute('href') || '(missing)',
      }));

    // 6. Navigation & Paint timings
    const nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    const paints = performance.getEntriesByType ? performance.getEntriesByType('paint') : [];
    const fcpEntry = paints.find((p) => p.name === 'first-contentful-paint');

    const timings = {
      ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadCompleteMs: nav && nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : null,
      fcpMs: fcpEntry ? Math.round(fcpEntry.startTime) : null,
    };

    const runtimeErrors = window.__QAUI?.getErrors ? window.__QAUI.getErrors().runtimeErrors : [];

    const hasCriticalFailures =
      runtimeErrors.length > 0 ||
      brokenImages.length > 0 ||
      failedResources.some((r) => r.status >= 500);

    return {
      timestamp: new Date().toISOString(),
      page: {
        url: window.location.href,
        title: document.title || '(empty title)',
        lang: docEl.getAttribute('lang') || '(missing lang)',
        viewport: `${vw}x${vh}`,
      },
      summary: {
        status: hasCriticalFailures ? 'FAIL' : failedResources.length > 0 || hasHorizontalOverflow ? 'WARN' : 'PASS',
        runtimeErrorCount: runtimeErrors.length,
        failedResourceCount: failedResources.length,
        slowResourceCount: slowResources.length,
        brokenImageCount: brokenImages.length,
        unlabeledControlCount: unlabeledControls.length,
        deadLinkCount: deadLinks.length,
        hasHorizontalOverflow,
        scrollWidthPx: scrollWidth,
      },
      timings,
      details: {
        runtimeErrors,
        failedResources: failedResources.slice(0, 20),
        slowResources: slowResources.slice(0, 10),
        brokenImages,
        unlabeledControls,
        deadLinks,
      },
    };
  }

  window.__runSurfaceAudit = runSurfaceAudit;
  return runSurfaceAudit();
})();
