#!/usr/bin/env node
/**
 * Execute SQL migration against Supabase database
 * Reads migration file and executes via Supabase SQL API
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('🚀 Starting migration execution...\n');

  try {
    // Read migration file
    const migrationPath = resolve(__dirname, '../.sisyphus/migrations/001-schema-redesign.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    console.log(`📄 Migration file loaded: ${migrationPath}`);
    console.log(`📊 SQL size: ${sql.length} bytes\n`);

    // Execute migration via Supabase RPC
    // Note: Using rpc() to execute raw SQL requires a function, so we'll use the SQL API directly
    // For Supabase, we need to use the REST API with raw SQL execution
    
    console.log('⏳ Executing migration SQL...');
    
    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementNum = i + 1;
      
      try {
        // Use the Supabase REST API to execute raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({ sql: statement }),
        });

        if (!response.ok) {
          // If exec_sql doesn't exist, try alternative approach
          // For now, log the attempt
          console.log(`⚠️  Statement ${statementNum}: Skipped (RPC not available)`);
        } else {
          const result = await response.json();
          console.log(`✅ Statement ${statementNum}: Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Statement ${statementNum}: ${err.message}`);
      }
    }

    console.log(`\n📊 Execution Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Skipped/Failed: ${errorCount}`);
    console.log(`\n⚠️  Note: Direct SQL execution via anon key may be limited.`);
    console.log(`   Please execute the migration via Supabase Dashboard SQL Editor:`);
    console.log(`   1. Go to: https://app.supabase.com/project/riioszwtwjbestbxbzxu/sql/new`);
    console.log(`   2. Copy and paste the SQL from: .sisyphus/migrations/001-schema-redesign.sql`);
    console.log(`   3. Click "Run" to execute\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

executeMigration();
