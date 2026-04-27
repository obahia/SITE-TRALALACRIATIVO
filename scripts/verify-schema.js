#!/usr/bin/env node
/**
 * Verification script for Supabase schema changes
 * Tests: products.category, testimonials table, shipping_costs table, profiles address fields
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runVerifications() {
  console.log('🔍 Starting Supabase schema verification...\n');

  let allPassed = true;

  // ============================================================================
  // Test 1: Verify products table has category column
  // ============================================================================
  console.log('Test 1: Verify products.category column exists and is populated');
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, category')
      .limit(5);

    if (error) throw error;

    if (!products || products.length === 0) {
      console.log('⚠️  Warning: No products found in database');
    } else {
      const allHaveCategory = products.every(p => p.category !== null && p.category !== undefined);
      if (allHaveCategory) {
        console.log(`✅ PASS: All ${products.length} sampled products have category values`);
        console.log(`   Sample categories: ${products.map(p => p.category).join(', ')}`);
      } else {
        console.log('❌ FAIL: Some products missing category values');
        allPassed = false;
      }
    }
  } catch (err) {
    console.log(`❌ FAIL: Error querying products - ${err.message}`);
    allPassed = false;
  }

  // ============================================================================
  // Test 2: Verify testimonials table exists and has seed data
  // ============================================================================
  console.log('\nTest 2: Verify testimonials table exists with seed data');
  try {
    const { data: testimonials, error } = await supabase
      .from('testimonials')
      .select('id, name, message, rating, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!testimonials || testimonials.length === 0) {
      console.log('❌ FAIL: No testimonials found');
      allPassed = false;
    } else if (testimonials.length < 4) {
      console.log(`❌ FAIL: Expected at least 4 testimonials, found ${testimonials.length}`);
      allPassed = false;
    } else {
      const allValid = testimonials.every(t => 
        t.name && t.message && t.rating >= 1 && t.rating <= 5
      );
      if (allValid) {
        console.log(`✅ PASS: Found ${testimonials.length} testimonials with valid data`);
        console.log(`   Sample: "${testimonials[0].name}" - Rating: ${testimonials[0].rating}⭐`);
      } else {
        console.log('❌ FAIL: Some testimonials have invalid data');
        allPassed = false;
      }
    }
  } catch (err) {
    console.log(`❌ FAIL: Error querying testimonials - ${err.message}`);
    allPassed = false;
  }

  // ============================================================================
  // Test 3: Verify shipping_costs table with all categories
  // ============================================================================
  console.log('\nTest 3: Verify shipping_costs table with all 5 categories');
  try {
    const { data: shippingCosts, error } = await supabase
      .from('shipping_costs')
      .select('category, cost')
      .order('category');

    if (error) throw error;

    const expectedCategories = ['azulejos', 'camisetas', 'canecas', 'kits', 'tote_bags'];
    const foundCategories = shippingCosts?.map(s => s.category) || [];

    if (shippingCosts && shippingCosts.length === 5) {
      const allPresent = expectedCategories.every(cat => foundCategories.includes(cat));
      const allHaveCost = shippingCosts.every(s => s.cost > 0);

      if (allPresent && allHaveCost) {
        console.log(`✅ PASS: All 5 categories present with valid costs`);
        shippingCosts.forEach(s => {
          console.log(`   ${s.category}: €${s.cost.toFixed(2)}`);
        });
      } else {
        console.log('❌ FAIL: Missing categories or invalid costs');
        allPassed = false;
      }
    } else {
      console.log(`❌ FAIL: Expected 5 shipping cost rows, found ${shippingCosts?.length || 0}`);
      allPassed = false;
    }
  } catch (err) {
    console.log(`❌ FAIL: Error querying shipping_costs - ${err.message}`);
    allPassed = false;
  }

  // ============================================================================
  // Test 4: Verify profiles table has address fields
  // ============================================================================
  console.log('\nTest 4: Verify profiles table has address columns');
  try {
    // Try to select address fields to verify they exist
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, phone, street, city, postal_code, country')
      .limit(1);

    if (error) {
      // If error is about missing columns, it will fail here
      throw error;
    }

    // If we got here, columns exist
    console.log('✅ PASS: All address columns exist (phone, street, city, postal_code, country)');
    if (profiles && profiles.length > 0) {
      console.log(`   Sample profile has country: ${profiles[0].country || 'NULL'}`);
    }
  } catch (err) {
    if (err.message.includes('column') || err.message.includes('does not exist')) {
      console.log(`❌ FAIL: Address columns missing - ${err.message}`);
    } else {
      console.log(`❌ FAIL: Error querying profiles - ${err.message}`);
    }
    allPassed = false;
  }

  // ============================================================================
  // Test 5: Verify RLS policies are in place
  // ============================================================================
  console.log('\nTest 5: Verify RLS policies allow authenticated reads');
  try {
    // This test assumes we're using anon key (authenticated but not admin)
    // If RLS is properly set, we should be able to read testimonials and shipping_costs
    const { data: testRead, error } = await supabase
      .from('testimonials')
      .select('id')
      .limit(1);

    if (error && error.message.includes('permission')) {
      console.log('❌ FAIL: RLS policy blocking authenticated reads on testimonials');
      allPassed = false;
    } else if (error) {
      console.log(`⚠️  Warning: Could not verify RLS - ${error.message}`);
    } else {
      console.log('✅ PASS: RLS policies allow authenticated reads');
    }
  } catch (err) {
    console.log(`⚠️  Warning: Could not verify RLS - ${err.message}`);
  }

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All verification tests PASSED');
    process.exit(0);
  } else {
    console.log('❌ Some verification tests FAILED');
    process.exit(1);
  }
}

runVerifications().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
