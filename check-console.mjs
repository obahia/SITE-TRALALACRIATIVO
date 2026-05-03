import { chromium } from '@playwright/test';

async function captureConsoleErrors() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleMessages = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  page.on('pageerror', error => {
    consoleMessages.push({
      type: 'pageerror',
      text: error.message,
      stack: error.stack
    });
  });

  page.on('requestfailed', request => {
    networkErrors.push({
      url: request.url(),
      failure: request.failure()?.errorText || 'Unknown error'
    });
  });

  console.log('Loading homepage and capturing console messages...\n');

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log('=== CONSOLE MESSAGES ===\n');
  consoleMessages.forEach(msg => {
    if (msg.type === 'error' || msg.type === 'warning' || msg.type === 'pageerror') {
      console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
      if (msg.stack) console.log(`  Stack: ${msg.stack.substring(0, 200)}`);
    }
  });

  console.log('\n=== NETWORK ERRORS ===\n');
  if (networkErrors.length === 0) {
    console.log('No network errors');
  } else {
    networkErrors.forEach(err => {
      console.log(`URL: ${err.url}`);
      console.log(`Error: ${err.failure}\n`);
    });
  }

  console.log('\n=== PAGE INFO ===\n');
  const pageContent = await page.content();
  const hasProducts = pageContent.includes('product') || pageContent.includes('produto');
  const hasLoader = pageContent.includes('loading') || pageContent.includes('carregando');
  
  console.log(`Page title: ${await page.title()}`);
  console.log(`Has "product" text: ${hasProducts}`);
  console.log(`Has "loading" text: ${hasLoader}`);
  console.log(`Page length: ${pageContent.length} chars`);

  // Try to get actual rendered product count
  const productElements = await page.locator('[data-testid*="product"], .product-card, article, [class*="product"]').count();
  console.log(`Product elements found: ${productElements}`);

  // Check for error messages on page
  const errorText = await page.locator('text=/error|erro|falha/i').count();
  console.log(`Error messages on page: ${errorText}`);

  await page.screenshot({ path: 'qa-screenshots/console-debug.png', fullPage: true });

  await browser.close();
}

captureConsoleErrors().catch(console.error);
