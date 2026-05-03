import { chromium } from '@playwright/test';

async function testProductDetail() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== TESTING PRODUCT DETAIL & CART ===\n');

  await page.goto('http://localhost:5174/produtos', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Click on first "Personalizar Agora" button
  const personalizeBtn = page.getByText('Personalizar Agora').first();
  const btnExists = await personalizeBtn.count() > 0;

  console.log(`"Personalizar Agora" button exists: ${btnExists}`);

  if (btnExists) {
    await personalizeBtn.click();
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`Navigated to: ${currentUrl}`);

    // Check product detail page elements
    const hasPrice = await page.locator('text=/€|EUR/').count() > 0;
    const hasImage = await page.locator('img').count() > 0;
    const hasTitle = await page.locator('h1, h2').count() > 0;

    console.log(`Has price: ${hasPrice}`);
    console.log(`Has image: ${hasImage}`);
    console.log(`Has title: ${hasTitle}`);

    await page.screenshot({ path: 'qa-screenshots/product-detail-fixed.png', fullPage: true });

    // Look for "Adicionar ao Carrinho" or similar
    const addCartBtn = page.locator('button').filter({ hasText: /adicionar|carrinho|comprar/i }).first();
    const hasAddCart = await addCartBtn.count() > 0;

    console.log(`Has add to cart button: ${hasAddCart}`);

    if (hasAddCart) {
      const btnText = await addCartBtn.textContent();
      console.log(`Button text: "${btnText}"`);

      await addCartBtn.click();
      await page.waitForTimeout(2000);

      console.log(`After click, URL: ${page.url()}`);

      // Check for cart indicator or confirmation
      const cartBadge = await page.locator('[class*="badge"]').count();
      const successMessage = await page.locator('text=/adicionado|sucesso|success|added/i').count();

      console.log(`Cart badge: ${cartBadge}`);
      console.log(`Success message: ${successMessage}`);

      await page.screenshot({ path: 'qa-screenshots/after-add-cart-fixed.png', fullPage: true });

      // Try to navigate to cart
      const cartUrl = page.url().includes('carrinho') ? page.url() : 'http://localhost:5174/carrinho';
      await page.goto(cartUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      const h1Cart = await page.locator('h1').first().textContent().catch(() => '');
      const hasCartItems = await page.locator('text=/azulejo|caneca|camiseta|produto/i').count() > 0;
      const hasCheckout = await page.locator('button').filter({ hasText: /checkout|finalizar|pagar/i }).count() > 0;

      console.log(`\nCart page H1: "${h1Cart}"`);
      console.log(`Has cart items: ${hasCartItems}`);
      console.log(`Has checkout button: ${hasCheckout}`);

      await page.screenshot({ path: 'qa-screenshots/cart-page-fixed.png', fullPage: true });
    }
  }

  await browser.close();
}

testProductDetail().catch(console.error);
