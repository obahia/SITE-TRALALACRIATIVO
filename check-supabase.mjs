import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://riioszwtwjbestbxbzxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaW9zend0d2piZXN0Ynhienh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NTA0NzUsImV4cCI6MjA4MjQyNjQ3NX0.H1ljosWv5lUKBBHTMfryrG_uFY3365EuZJAV3An48_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
  console.log('Checking Supabase connectivity and data...\n');

  try {
    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (productsError) {
      console.log('❌ Products table error:', productsError.message);
    } else {
      console.log(`✓ Products table: ${products?.length || 0} products found`);
      if (products && products.length > 0) {
        console.log('  Sample product:', products[0].name || products[0].title || 'N/A');
      }
    }

    // Check categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.log('❌ Categories table error:', categoriesError.message);
    } else {
      console.log(`✓ Categories table: ${categories?.length || 0} categories found`);
    }

    // Check if tables exist by trying to query them
    const { error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('\n❌ Database connection issue:', testError.message);
    } else {
      console.log('\n✓ Database connection successful');
    }

  } catch (error) {
    console.log('❌ General error:', error.message);
  }
}

checkSupabase();
