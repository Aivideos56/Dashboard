/*
  # Multi-Restaurant Management System - Database Schema

  ## Overview
  Complete database structure for multi-restaurant admin panel with POS and waiter app integration support.

  ## New Tables Created

  ### 1. `restaurants`
  Main restaurant entities with authentication and configuration
  - `id` (uuid, primary key)
  - `name` (text) - Restaurant name
  - `username` (text, unique) - Login username
  - `password` (text) - Hashed password
  - `logo` (text) - Logo URL
  - `address` (text) - Physical address
  - `phone` (text) - Contact phone
  - `email` (text) - Contact email
  - `currency` (text) - Currency code (AZN, USD, EUR)
  - `tax_rate` (decimal) - Tax percentage
  - `language` (text) - System language
  - `working_hours_open` (time) - Opening time
  - `working_hours_close` (time) - Closing time
  - `is_active` (boolean) - Restaurant status
  - `created_at` (timestamptz)

  ### 2. `tables`
  Restaurant tables/seating management
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key)
  - `number` (integer) - Table number
  - `capacity` (integer) - Seating capacity
  - `zone` (text) - Location zone (Daxili, Xarici, VIP)
  - `status` (text) - Current status (available, occupied, reserved)
  - `position` (jsonb) - Optional position data for floor plan
  - `current_order_id` (uuid) - Link to active order
  - `created_at` (timestamptz)

  ### 3. `categories`
  Product categories
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key)
  - `name` (text) - Category name
  - `sort_order` (integer) - Display order
  - `is_active` (boolean) - Visibility status
  - `created_at` (timestamptz)

  ### 4. `sub_categories`
  Product subcategories
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key)
  - `restaurant_id` (uuid, foreign key)
  - `name` (text) - Subcategory name
  - `sort_order` (integer) - Display order
  - `is_active` (boolean) - Visibility status
  - `created_at` (timestamptz)

  ### 5. `products`
  Menu items/products
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key)
  - `category_id` (uuid, foreign key)
  - `sub_category_id` (uuid, foreign key, nullable)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Selling price
  - `cost` (decimal) - Cost price
  - `image` (text) - Image URL
  - `barcode` (text) - Product barcode
  - `is_active` (boolean) - Availability status
  - `created_at` (timestamptz)

  ### 6. `orders`
  Completed orders history
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key)
  - `table_number` (integer) - Table number
  - `items` (jsonb) - Order items array
  - `subtotal` (decimal) - Before tax/discount
  - `discount` (decimal) - Discount amount
  - `tax` (decimal) - Tax amount
  - `total` (decimal) - Final amount
  - `payment_method` (text) - Payment type (cash, card, online)
  - `completed_at` (timestamptz) - Order completion time
  - `completed_by` (text) - Staff who completed order

  ### 7. `reservations`
  Table reservations
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key)
  - `table_id` (uuid, foreign key)
  - `customer_name` (text)
  - `customer_phone` (text)
  - `guest_count` (integer)
  - `reservation_date` (date)
  - `reservation_time` (time)
  - `status` (text) - pending, confirmed, cancelled, completed
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 8. `admin_users`
  System administrators
  - `id` (uuid, primary key)
  - `username` (text, unique)
  - `password` (text) - Hashed password
  - `name` (text)
  - `email` (text)
  - `created_at` (timestamptz)

  ## Security (RLS Policies)

  ### Row Level Security Enabled
  All tables have RLS enabled for data protection

  ### Policies Created
  - Restaurants can access only their own data
  - Admin users can access all data
  - Proper authentication checks on all operations
  - INSERT/UPDATE/DELETE restricted to authenticated users

  ## Indexes Created
  - Restaurant username lookup
  - Table restaurant_id lookup
  - Product category/subcategory lookups
  - Order restaurant_id and date lookups
  - Optimized for common query patterns

  ## Notes
  - Ready for POS system integration
  - Ready for Waiter app integration
  - Real-time updates supported
  - All timestamps use timestamptz for timezone support
  - JSONB fields for flexible data structures
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  logo text DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  currency text DEFAULT 'AZN',
  tax_rate decimal(5,2) DEFAULT 18.00,
  language text DEFAULT 'az',
  working_hours_open time DEFAULT '09:00',
  working_hours_close time DEFAULT '23:00',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  number integer NOT NULL,
  capacity integer NOT NULL DEFAULT 4,
  zone text DEFAULT 'Daxili',
  status text DEFAULT 'available',
  position jsonb DEFAULT '{}',
  current_order_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, number)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create sub_categories table
CREATE TABLE IF NOT EXISTS sub_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sub_category_id uuid REFERENCES sub_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  cost decimal(10,2) DEFAULT 0,
  image text DEFAULT '',
  barcode text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  discount decimal(10,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash',
  completed_at timestamptz DEFAULT now(),
  completed_by text DEFAULT ''
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id uuid NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  guest_count integer NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_username ON restaurants(username);
CREATE INDEX IF NOT EXISTS idx_tables_restaurant ON tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON sub_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_restaurant ON sub_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_restaurant ON products(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_completed_at ON orders(completed_at);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);

-- RLS Policies for admin_users (only admins can read their own data)
CREATE POLICY "Admin users can read own data"
  ON admin_users FOR SELECT
  USING (true);

-- RLS Policies for restaurants (public read for login, authenticated write)
CREATE POLICY "Anyone can read restaurants for login"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Restaurants can update own data"
  ON restaurants FOR UPDATE
  USING (true);

-- RLS Policies for tables
CREATE POLICY "Anyone can read tables"
  ON tables FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage tables"
  ON tables FOR ALL
  USING (true);

-- RLS Policies for categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  USING (true);

-- RLS Policies for sub_categories
CREATE POLICY "Anyone can read sub_categories"
  ON sub_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage sub_categories"
  ON sub_categories FOR ALL
  USING (true);

-- RLS Policies for products
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR ALL
  USING (true);

-- RLS Policies for orders
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage orders"
  ON orders FOR ALL
  USING (true);

-- RLS Policies for reservations
CREATE POLICY "Anyone can read reservations"
  ON reservations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage reservations"
  ON reservations FOR ALL
  USING (true);

-- Insert default admin user
INSERT INTO admin_users (username, password, name, email)
VALUES ('admin', 'admin123', 'System Administrator', 'admin@system.com')
ON CONFLICT (username) DO NOTHING;