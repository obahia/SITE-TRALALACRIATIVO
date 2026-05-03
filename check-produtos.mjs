import { chromium } from '@playwright/test';

async function detailedProductsCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5174/produtos', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('=== PRODUTOS PAGE ANALYSIS ===\n');

  const h1 = await page.locator('h1').allTextContents();
  console.log('H1 headings:', h1);

  const h2 = await page.locator('h2').allTextContents();
  console.log('H2 headings:', h2);

  // Check for loading state
  const loadingText = await page.getByText(/carregando|loading/i).count();
  console.log(`Loading indicators: ${loadingText}`);

  // Check for error messages
  const errorText = await page.getByText(/erro|error|falha/i).count();
  console.log(`Error messages: ${errorText}`);

  // Check for "no products" message
  const noProducts = await page.getByText(/nenhum produto|no products|sem produtos/i).count();
  console.log(`"No products" messages: ${noProducts}`);

  // Look for any card-like structures
  const articles = await page.locator('article').count();
  const divWithClass = await page.locator('div[class*="card"], div[class*="product"], div[class*="item"]').count();
  console.log(`Articles: ${articles}, Card-like divs: ${divWithClass}`);

  // Get page text to see what's actually showing
  const bodyText = await page.locator('body').textContent();
  const relevantText = bodyText.substring(0, 1000);
  console.log('\nFirst 1000 chars of body text:');
  console.log(relevantText);

  // Take a detailed screenshot
  await page.screenshot({ path: 'qa-screenshots/produtos-detailed.png', fullPage: true });

  await browser.close();
}

detailedProductsCheck().catch(console.error);
