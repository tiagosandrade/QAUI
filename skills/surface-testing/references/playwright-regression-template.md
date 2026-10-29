# Exporting Live Flows to `@playwright/test` Regression Specs

When the user asks to **persist**, **automate for CI/CD**, or **save** a validated surface test inside a target project, generate a clean `@playwright/test` spec using semantic locators and automatic console/network assertions.

> **Important:** Never install `@playwright/test` or modify a target project's `package.json` without asking the user first if the project does not already include Playwright.

## Reference Spec Template (`e2e/surface.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Surface Smoke Suite', () => {
  test('completes critical user journey with zero runtime or 5xx errors', async ({ page }) => {
    const pageErrors: string[] = [];
    const serverFailures: string[] = [];

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('response', (res) => {
      if (res.status() >= 500) {
        serverFailures.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto('/');

    // Replace with semantic steps discovered during the live MCP run:
    // await page.getByPlaceholder(/search|pesquisar/i).fill('Example');
    // await page.getByRole('button', { name: /search|pesquisar/i }).click();

    // Verify no broken visible images
    const brokenImages = await page.locator('img:visible').evaluateAll((imgs) =>
      imgs
        .filter((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth === 0)
        .map((img) => img.getAttribute('src'))
    );

    expect(pageErrors, 'Uncaught page exceptions').toEqual([]);
    expect(serverFailures, 'HTTP 5xx responses').toEqual([]);
    expect(brokenImages, 'Broken visible images').toEqual([]);
  });
});
```

## Running Interactively with Playwright UI Mode
Recommend the official Playwright UI Mode for frame-by-frame visual inspection, DOM snapshots, and network timelines:
```bash
npx playwright test --ui
```
