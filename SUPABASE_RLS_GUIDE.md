# Supabase Row Level Security (RLS) Guide

Row Level Security (RLS) is crucial for securing your users' data. It ensures that users can only access data they are permitted to see (e.g., their own orders).

## 1. Enable RLS on Tables
For every table that contains sensitive user data, you **MUST** enable RLS.

Run the following SQL in the **Supabase SQL Editor**:

```sql
-- Enable RLS for specific tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

## 2. Create Access Policies
Once RLS is enabled, no one (except service roles) can access the data until you define policies.

### Profiles Table
Users should be able to view and update their own profile, but not others.

```sql
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);
```

### Orders Table
Users should only see their own orders.

```sql
-- Allow users to view their own orders
CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to create orders (during checkout)
CREATE POLICY "Users can create orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

## 3. Storage Buckets (Images)
If you have private file uploads.

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'my_bucket');
```

## 4. Testing RLS
You can test your policies directly in the Supabase Dashboard "Table Editor" by impersonating a user, or by using the application.
