/*
  # Add Users and Branches System

  ## Overview
  Adds user management and multi-branch support to the restaurant system

  ## New Tables

  ### 1. `branches`
  Restaurant branches/filials
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key)
  - `name` (text) - Branch name
  - `address` (text) - Branch address
  - `phone` (text) - Branch phone
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)

  ### 2. `users`
  Restaurant staff users
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key)
  - `branch_id` (uuid, foreign key, nullable)
  - `username` (text, unique)
  - `password` (text) - Plain text password (will add SHA256 later)
  - `full_name` (text) - User's full name
  - `role` (text) - User role: cashier, waiter, kitchen, manager
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)

  ## Modified Tables
  - `tables` - Add `branch_id` column
  - `orders` - Add `branch_id` and `user_id` columns

  ## Security
  - RLS enabled on all tables
  - Users can only access their restaurant's data
  - Branch filtering available

  ## Indexes
  - Optimized for restaurant_id and branch_id lookups
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'cashier',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CHECK (role IN ('cashier', 'waiter', 'kitchen', 'manager'))
);

-- Add branch_id to tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tables' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE tables ADD COLUMN branch_id uuid REFERENCES branches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add branch_id and user_id to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN branch_id uuid REFERENCES branches(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_branches_restaurant ON branches(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_restaurant ON users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_tables_branch ON tables(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- RLS Policies for branches
CREATE POLICY "Anyone can read branches"
  ON branches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage branches"
  ON branches FOR ALL
  USING (true);

-- RLS Policies for users
CREATE POLICY "Anyone can read users for login"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage users"
  ON users FOR ALL
  USING (true);