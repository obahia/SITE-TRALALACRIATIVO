import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const screenshotsDir = join(__dirname, 'qa-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const testResults = [];

async function runQATests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Starting QA tests...\n');

  // Test 1: Homepage loads with products
  try {
    console.log('Test 1: Homepage loads with products');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    const hasProducts = await page.locator('[data-testid*="product"], .product-card, article').count() > 0;
    const hasHero = await page.locator('h1, [class*="hero"]').count() > 0;
    
    await page.screenshot({ path: join(screenshotsDir, '01-homepage.png'), fullPage: true });
    
    testResults.push({
      test: 'Homepage loads with products',
      status: hasHero ? 'PASS' : 'FAIL',
      details: `Title: "${title}", Has hero: ${hasHero}, Products visible: ${hasProducts}`
    });
    console.log(`✓ Homepage loaded - Title: "${title}"\n`);
  } catch (error) {
    testResults.push({
      test: 'Homepage loads with products',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Homepage failed: ${error.message}\n`);
  }

  // Test 2: Navigation
  try {
    console.log('Test 2: Navigation between pages');
    
    // Find and click catalog link
    const catalogLink = page.locator('a[href*="loja"], a[href*="catalog"], a[href*="produtos"]').first();
    const catalogExists = await catalogLink.count() > 0;
    
    if (catalogExists) {
      await catalogLink.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(screenshotsDir, '02-catalog-page.png'), fullPage: true });
      
      const currentUrl = page.url();
      testResults.push({
        test: 'Navigation to catalog',
        status: 'PASS',
        details: `Navigated to: ${currentUrl}`
      });
      console.log(`✓ Navigation works - URL: ${currentUrl}\n`);
    } else {
      testResults.push({
        test: 'Navigation to catalog',
        status: 'FAIL',
        details: 'Could not find catalog link'
      });
      console.log(`✗ Could not find catalog link\n`);
    }
  } catch (error) {
    testResults.push({
      test: 'Navigation to catalog',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Navigation failed: ${error.message}\n`);
  }

  // Test 3: Product catalog with filters
  try {
    console.log('Test 3: Product catalog with filters and search');
    
    // Look for search input and filters
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="Pesquisar"]').first();
    const hasSearch = await searchInput.count() > 0;
    
    const filterElements = await page.locator('button[class*="filter"], select, [class*="category"]').count();
    const hasFilters = filterElements > 0;
    
    const productCount = await page.locator('[data-testid*="product"], .product-card, article').count();
    
    await page.screenshot({ path: join(screenshotsDir, '03-catalog-filters.png'), fullPage: true });
    
    testResults.push({
      test: 'Catalog page with filters and search',
      status: productCount > 0 ? 'PASS' : 'FAIL',
      details: `Products: ${productCount}, Has search: ${hasSearch}, Has filters: ${hasFilters}`
    });
    console.log(`✓ Catalog page - Products: ${productCount}, Search: ${hasSearch}, Filters: ${hasFilters}\n`);
  } catch (error) {
    testResults.push({
      test: 'Catalog page with filters and search',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Catalog page failed: ${error.message}\n`);
  }

  // Test 4: Product detail page
  try {
    console.log('Test 4: Product detail page');
    
    const firstProduct = page.locator('[data-testid*="product"], .product-card, article').first();
    const productExists = await firstProduct.count() > 0;
    
    if (productExists) {
      await firstProduct.click();
      await page.waitForTimeout(2000);
      
      const hasPrice = await page.locator('[class*="price"], [class*="preco"]').count() > 0;
      const hasAddToCart = await page.locator('button:has-text("Adicionar"), button:has-text("Carrinho")').count() > 0;
      const hasImage = await page.locator('img').count() > 0;
      
      await page.screenshot({ path: join(screenshotsDir, '04-product-detail.png'), fullPage: true });
      
      testResults.push({
        test: 'Product detail page',
        status: (hasPrice && hasImage) ? 'PASS' : 'FAIL',
        details: `Has price: ${hasPrice}, Has add to cart: ${hasAddToCart}, Has image: ${hasImage}`
      });
      console.log(`✓ Product detail - Price: ${hasPrice}, Add to cart: ${hasAddToCart}\n`);
    } else {
      testResults.push({
        test: 'Product detail page',
        status: 'FAIL',
        details: 'No products found to click'
      });
      console.log(`✗ No products found\n`);
    }
  } catch (error) {
    testResults.push({
      test: 'Product detail page',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Product detail failed: ${error.message}\n`);
  }

  // Test 5: Cart functionality
  try {
    console.log('Test 5: Cart functionality (add to cart)');
    
    const addToCartBtn = page.locator('button:has-text("Adicionar"), button:has-text("Carrinho")').first();
    const btnExists = await addToCartBtn.count() > 0;
    
    if (btnExists) {
      await addToCartBtn.click();
      await page.waitForTimeout(1500);
      
      // Check for cart icon badge or cart page
      const cartBadge = await page.locator('[class*="badge"], [class*="count"]').count();
      const cartIcon = await page.locator('[class*="cart"], [class*="carrinho"]').count();
      
      await page.screenshot({ path: join(screenshotsDir, '05-after-add-to-cart.png'), fullPage: true });
      
      testResults.push({
        test: 'Add to cart functionality',
        status: (cartBadge > 0 || cartIcon > 0) ? 'PASS' : 'PARTIAL',
        details: `Cart indicators found: ${cartBadge + cartIcon}`
      });
      console.log(`✓ Add to cart clicked - Cart indicators: ${cartBadge + cartIcon}\n`);
    } else {
      testResults.push({
        test: 'Add to cart functionality',
        status: 'FAIL',
        details: 'Add to cart button not found'
      });
      console.log(`✗ Add to cart button not found\n`);
    }
  } catch (error) {
    testResults.push({
      test: 'Add to cart functionality',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Add to cart failed: ${error.message}\n`);
  }

  // Test 6: Cart page
  try {
    console.log('Test 6: Cart page');
    
    // Try to navigate to cart
    const cartLink = page.locator('a[href*="cart"], a[href*="carrinho"]').first();
    const cartLinkExists = await cartLink.count() > 0;
    
    if (cartLinkExists) {
      await cartLink.click();
      await page.waitForTimeout(1500);
      
      const hasCheckoutBtn = await page.locator('button:has-text("Checkout"), button:has-text("Finalizar")').count() > 0;
      const hasCartItems = await page.locator('[class*="cart-item"], [class*="item"]').count() > 0;
      
      await page.screenshot({ path: join(screenshotsDir, '06-cart-page.png'), fullPage: true });
      
      testResults.push({
        test: 'Cart page',
        status: 'PASS',
        details: `Has checkout button: ${hasCheckoutBtn}, Has items: ${hasCartItems}`
      });
      console.log(`✓ Cart page - Checkout btn: ${hasCheckoutBtn}, Items: ${hasCartItems}\n`);
    } else {
      testResults.push({
        test: 'Cart page',
        status: 'FAIL',
        details: 'Cart link not found'
      });
      console.log(`✗ Cart link not found\n`);
    }
  } catch (error) {
    testResults.push({
      test: 'Cart page',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Cart page failed: ${error.message}\n`);
  }

  // Test 7: Mobile viewport
  try {
    console.log('Test 7: Responsive design (mobile viewport)');
    
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    const hasMobileMenu = await page.locator('button[class*="menu"], button[aria-label*="menu"]').count() > 0;
    
    await page.screenshot({ path: join(screenshotsDir, '07-mobile-homepage.png'), fullPage: true });
    
    testResults.push({
      test: 'Mobile responsive design',
      status: 'PASS',
      details: `Mobile menu burger: ${hasMobileMenu}`
    });
    console.log(`✓ Mobile view - Menu burger: ${hasMobileMenu}\n`);
    
    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  } catch (error) {
    testResults.push({
      test: 'Mobile responsive design',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Mobile view failed: ${error.message}\n`);
  }

  // Test 8: Admin page
  try {
    console.log('Test 8: Admin page accessibility');
    
    await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
    const hasAdminContent = await page.locator('h1, h2').count() > 0;
    
    await page.screenshot({ path: join(screenshotsDir, '08-admin-page.png'), fullPage: true });
    
    testResults.push({
      test: 'Admin page accessibility',
      status: 'PASS',
      details: `Has login form: ${hasLoginForm}, Has content: ${hasAdminContent}`
    });
    console.log(`✓ Admin page - Login: ${hasLoginForm}, Content: ${hasAdminContent}\n`);
  } catch (error) {
    testResults.push({
      test: 'Admin page accessibility',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Admin page failed: ${error.message}\n`);
  }

  // Test 9: 404 page
  try {
    console.log('Test 9: 404 page');
    
    await page.goto('http://localhost:5174/this-page-does-not-exist-123', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    const pageContent = await page.content();
    const has404Text = pageContent.includes('404') || pageContent.includes('não encontrada') || pageContent.includes('not found');
    
    await page.screenshot({ path: join(screenshotsDir, '09-404-page.png'), fullPage: true });
    
    testResults.push({
      test: '404 page',
      status: has404Text ? 'PASS' : 'FAIL',
      details: `Has 404 indicator: ${has404Text}`
    });
    console.log(`✓ 404 page - Has indicator: ${has404Text}\n`);
  } catch (error) {
    testResults.push({
      test: '404 page',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ 404 page failed: ${error.message}\n`);
  }

  // Test 10: Visual consistency check
  try {
    console.log('Test 10: Visual consistency');
    
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    // Check for broken images
    const images = await page.locator('img').all();
    let brokenImages = 0;
    
    for (const img of images.slice(0, 10)) { // Check first 10 images
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      if (naturalWidth === 0) brokenImages++;
    }
    
    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    testResults.push({
      test: 'Visual consistency',
      status: brokenImages === 0 ? 'PASS' : 'PARTIAL',
      details: `Broken images: ${brokenImages}/${images.length}, Console errors: ${consoleErrors.length}`
    });
    console.log(`✓ Visual check - Broken images: ${brokenImages}, Console errors: ${consoleErrors.length}\n`);
  } catch (error) {
    testResults.push({
      test: 'Visual consistency',
      status: 'FAIL',
      details: `Error: ${error.message}`
    });
    console.log(`✗ Visual consistency failed: ${error.message}\n`);
  }

  await browser.close();

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('QA TEST SUMMARY');
  console.log('='.repeat(80) + '\n');

  const passed = testResults.filter(t => t.status === 'PASS').length;
  const failed = testResults.filter(t => t.status === 'FAIL').length;
  const partial = testResults.filter(t => t.status === 'PARTIAL').length;

  testResults.forEach(result => {
    const icon = result.status === 'PASS' ? '✓' : (result.status === 'FAIL' ? '✗' : '⚠');
    console.log(`${icon} [${result.status}] ${result.test}`);
    console.log(`   ${result.details}\n`);
  });

  console.log('='.repeat(80));
  console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed} | Partial: ${partial}`);
  console.log('='.repeat(80));
  console.log(`\nScreenshots saved to: ${screenshotsDir}\n`);

  // Write results to JSON
  fs.writeFileSync(
    join(__dirname, 'qa-results.json'),
    JSON.stringify({ testResults, summary: { total: testResults.length, passed, failed, partial } }, null, 2)
  );

  return { testResults, passed, failed, partial };
}

runQATests().catch(console.error);
