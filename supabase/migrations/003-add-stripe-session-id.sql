-- Migration: Add stripe_session_id column to orders table
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
