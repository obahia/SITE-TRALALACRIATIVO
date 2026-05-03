import { chromium } from '@playwright/test';

async function debugRequests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const failed404 = [];
  
  page.on('response', response => {
    if (response.status() === 404) {
      failed404.push(response.url());
    }
  });

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('=== 404 ERRORS ===\n');
  failed404.forEach(url => console.log(url));

  console.log('\n=== RENDERED HTML (first 3000 chars of body) ===\n');
  const bodyHTML = await page.locator('body').innerHTML();
  console.log(bodyHTML.substring(0, 3000));

  console.log('\n=== CHECKING FOR PRODUCT DATA ===\n');
  
  // Check if React app mounted
  const rootContent = await page.locator('#root').innerHTML();
  console.log(`Root element has content: ${rootContent.length > 100}`);

  // Look for specific elements
  const h1 = await page.locator('h1').first().textContent().catch(() => 'N/A');
  console.log(`First H1: ${h1}`);

  const buttons = await page.locator('button').count();
  console.log(`Buttons on page: ${buttons}`);

  const images = await page.locator('img').count();
  console.log(`Images on page: ${images}`);

  await browser.close();
}

debugRequests().catch(console.error);
