CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'Order placed',
  email text,
  customer_name text,
  address jsonb NOT NULL DEFAULT '[]'::jsonb,
  phone text,
  subtotal numeric NOT NULL DEFAULT 0,
  shipping numeric NOT NULL DEFAULT 0,
  taxes numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  handle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '0',
  status text NOT NULL DEFAULT 'Order placed',
  step integer NOT NULL DEFAULT 0,
  date text NOT NULL DEFAULT '',
  datetime text NOT NULL DEFAULT '',
  image_src text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  size text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_orders" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT TO anon WITH CHECK (true);
