import { chromium } from '@playwright/test';

async function testCartSidebar() {
  const browser = await chromium.launch({ headless: false }); // visible to see what happens
  const page = await browser.newPage();

  console.log('=== TESTING CART SIDEBAR ===\n');

  await page.goto('http://localhost:5174/produtos', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Take before screenshot
  await page.screenshot({ path: 'qa-screenshots/before-cart.png', fullPage: true });

  // Click on first product
  const personalizeBtn = page.getByText('Personalizar Agora').first();
  await personalizeBtn.click();
  await page.waitForTimeout(2000);

  console.log('On product page:', page.url());

  // Click "Adicionar ao Carrinho"
  const addCartBtn = page.locator('button').filter({ hasText: /adicionar.*carrinho/i }).first();
  const btnText = await addCartBtn.textContent();
  console.log(`Clicking: "${btnText}"`);

  await addCartBtn.click();
  await page.waitForTimeout(3000);

  // Check if sidebar appeared
  const sidebar = await page.locator('[class*="sidebar"], [class*="cart"]').count();
  console.log(`Sidebar elements: ${sidebar}`);

  // Check for cart icon badge
  const badge = await page.locator('[class*="badge"]').allTextContents();
  console.log(`Badges found:`, badge);

  await page.screenshot({ path: 'qa-screenshots/after-cart-click.png', fullPage: true });

  // Try clicking cart icon in header
  const cartIcon = page.locator('svg[class*="cart"], button:has(svg)').filter({ has: page.locator('circle') }).first();
  const hasCartIcon = await cartIcon.count() > 0;

  console.log(`Cart icon in header exists: ${hasCartIcon}`);

  if (hasCartIcon) {
    await cartIcon.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'qa-screenshots/cart-sidebar-open.png', fullPage: true });

    // Check sidebar content
    const sidebarContent = await page.locator('body').textContent();
    const hasTotal = sidebarContent.includes('€') || sidebarContent.includes('Total');
    const hasCheckout = await page.locator('button').filter({ hasText: /checkout|finalizar/i }).count();

    console.log(`Sidebar has total: ${hasTotal}`);
    console.log(`Sidebar has checkout: ${hasCheckout}`);
  }

  await page.waitForTimeout(2000);
  await browser.close();
}

testCartSidebar().catch(console.error);
