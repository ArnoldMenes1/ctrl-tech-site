-- CTRL-TECH — Structure SQL extraite de Neon
-- Base : ctrltech | Branche source : br-weathered-truth-bayel0tz | Date : 2026-11-12
-- Structure seulement : aucune donnée applicative n'est exportée.
-- neon_auth.* est géré par Neon Auth et n'est pas inclus.
-- public.migrations est un registre technique et n'est pas inclus.

BEGIN;

CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS storefront;

-- Séquences
CREATE SEQUENCE IF NOT EXISTS public.brands_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.inventory_movements_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.order_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.orders_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.product_images_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.product_variants_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.products_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.promotions_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.storefront_order_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.storefront_orders_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.users_id_seq;
CREATE SEQUENCE IF NOT EXISTS storefront.admin_audit_logs_id_seq;
CREATE SEQUENCE IF NOT EXISTS storefront.order_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS storefront.orders_id_seq;

-- public.brands
CREATE TABLE public.brands (
  id bigint DEFAULT nextval('brands_id_seq'::regclass) NOT NULL,
  name character varying(120) NOT NULL,
  slug character varying(140) NOT NULL,
  description text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT brands_pkey PRIMARY KEY (id),
  CONSTRAINT brands_slug_key UNIQUE (slug)
);

-- public.categories
CREATE TABLE public.categories (
  id bigint DEFAULT nextval('categories_id_seq'::regclass) NOT NULL,
  name character varying(120) NOT NULL,
  slug character varying(140) NOT NULL,
  description text,
  is_active boolean DEFAULT true NOT NULL,
  sort_order smallint DEFAULT 0 NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_slug_key UNIQUE (slug)
);

-- public.inventory_movements
CREATE TABLE public.inventory_movements (
  id bigint DEFAULT nextval('inventory_movements_id_seq'::regclass) NOT NULL,
  product_id bigint NOT NULL,
  user_id bigint,
  type character varying(24) NOT NULL,
  quantity integer NOT NULL,
  stock_after integer NOT NULL,
  reason character varying(255),
  reference character varying(100),
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT inventory_movements_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT inventory_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- public.order_items
CREATE TABLE public.order_items (
  id bigint DEFAULT nextval('order_items_id_seq'::regclass) NOT NULL,
  order_id bigint NOT NULL,
  product_id bigint,
  product_name character varying(180) NOT NULL,
  sku character varying(80),
  quantity smallint NOT NULL,
  unit_price numeric(15,2) NOT NULL,
  line_total numeric(15,2) NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- public.orders
CREATE TABLE public.orders (
  id bigint DEFAULT nextval('orders_id_seq'::regclass) NOT NULL,
  user_id bigint,
  reference character varying(24) NOT NULL,
  customer_name character varying(160) NOT NULL,
  customer_email character varying(190) NOT NULL,
  customer_phone character varying(40) NOT NULL,
  delivery_address character varying(500) NOT NULL,
  delivery_area character varying(120) NOT NULL,
  notes text,
  currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
  subtotal numeric(15,2) NOT NULL,
  delivery_fee numeric(15,2) DEFAULT 0 NOT NULL,
  total numeric(15,2) NOT NULL,
  status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
  payment_method character varying(50),
  payment_status character varying(30) DEFAULT 'unpaid'::character varying NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  delivery_method character varying(40) DEFAULT 'local_delivery'::character varying NOT NULL,
  payment_reference character varying(120),
  promotion_id bigint,
  promotion_code character varying(40),
  discount_amount numeric(15,2) DEFAULT 0 NOT NULL,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_promotion_id_foreign FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
  CONSTRAINT orders_reference_key UNIQUE (reference),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- public.password_reset_tokens
CREATE TABLE public.password_reset_tokens (
  email character varying(255) NOT NULL,
  token character varying(255) NOT NULL,
  created_at timestamp without time zone,
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email)
);

-- public.product_images
CREATE TABLE public.product_images (
  id bigint DEFAULT nextval('product_images_id_seq'::regclass) NOT NULL,
  product_id bigint NOT NULL,
  path character varying(500) NOT NULL,
  alt character varying(180),
  is_primary boolean DEFAULT false NOT NULL,
  sort_order smallint DEFAULT 0 NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- public.product_variants
CREATE TABLE public.product_variants (
  id bigint DEFAULT nextval('product_variants_id_seq'::regclass) NOT NULL,
  product_id bigint NOT NULL,
  name character varying(120) NOT NULL,
  sku character varying(80),
  options json,
  price_delta numeric(12,2) DEFAULT 0 NOT NULL,
  stock_quantity integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT product_variants_sku_key UNIQUE (sku)
);

-- public.products
CREATE TABLE public.products (
  id bigint DEFAULT nextval('products_id_seq'::regclass) NOT NULL,
  category_id bigint,
  name character varying(180) NOT NULL,
  slug character varying(200) NOT NULL,
  sku character varying(80),
  brand character varying(120),
  short_description character varying(255),
  description text,
  price_usd numeric(12,2),
  image_path character varying(255),
  stock_quantity integer DEFAULT 0 NOT NULL,
  specifications json,
  is_active boolean DEFAULT false NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  price_cdf numeric(15,2),
  price_confirmed boolean DEFAULT false NOT NULL,
  availability_status character varying(30) DEFAULT 'to_confirm'::character varying NOT NULL,
  family character varying(120),
  source_name character varying(160),
  source_url character varying(500),
  low_stock_threshold integer DEFAULT 3 NOT NULL,
  published_at timestamp without time zone,
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_sku_key UNIQUE (sku),
  CONSTRAINT products_slug_key UNIQUE (slug)
);

-- public.promotions
CREATE TABLE public.promotions (
  id bigint DEFAULT nextval('promotions_id_seq'::regclass) NOT NULL,
  name character varying(140) NOT NULL,
  code character varying(40),
  type character varying(20) NOT NULL,
  value numeric(12,2) NOT NULL,
  minimum_order numeric(12,2) DEFAULT 0 NOT NULL,
  starts_at timestamp without time zone,
  ends_at timestamp without time zone,
  usage_limit integer,
  usage_count integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  CONSTRAINT promotions_code_key UNIQUE (code),
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);

-- public.sessions
CREATE TABLE public.sessions (
  id character varying(255) NOT NULL,
  user_id bigint,
  ip_address character varying(45),
  user_agent text,
  payload text NOT NULL,
  last_activity integer NOT NULL,
  CONSTRAINT sessions_pkey PRIMARY KEY (id)
);

-- public.storefront_order_items
CREATE TABLE public.storefront_order_items (
  id bigint DEFAULT nextval('storefront_order_items_id_seq'::regclass) NOT NULL,
  order_id bigint NOT NULL,
  product_id character varying(16) NOT NULL,
  product_slug character varying(160) NOT NULL,
  product_name character varying(255) NOT NULL,
  brand character varying(120) NOT NULL,
  quantity integer NOT NULL,
  unit_price_usd numeric(12,2) NOT NULL,
  line_total_usd numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT storefront_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES storefront_orders(id) ON DELETE CASCADE,
  CONSTRAINT storefront_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT storefront_order_items_quantity_check CHECK ((quantity > 0))
);

-- public.storefront_orders
CREATE TABLE public.storefront_orders (
  id bigint DEFAULT nextval('storefront_orders_id_seq'::regclass) NOT NULL,
  reference character varying(40) NOT NULL,
  auth_user_id text NOT NULL,
  customer_name character varying(160) NOT NULL,
  customer_email character varying(255) NOT NULL,
  customer_phone character varying(40) NOT NULL,
  delivery_address character varying(255) NOT NULL,
  delivery_area character varying(120) NOT NULL,
  notes text,
  currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
  exchange_rate numeric(12,2) DEFAULT 2800 NOT NULL,
  subtotal_usd numeric(12,2) NOT NULL,
  total_usd numeric(12,2) NOT NULL,
  total_cdf numeric(16,2) NOT NULL,
  status character varying(40) DEFAULT 'pending_confirmation'::character varying NOT NULL,
  payment_method character varying(40) DEFAULT 'cash_in_person'::character varying NOT NULL,
  payment_status character varying(40) DEFAULT 'unpaid'::character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT storefront_orders_pkey PRIMARY KEY (id),
  CONSTRAINT storefront_orders_reference_key UNIQUE (reference)
);

-- public.users
CREATE TABLE public.users (
  id bigint DEFAULT nextval('users_id_seq'::regclass) NOT NULL,
  name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  email_verified_at timestamp without time zone,
  password character varying(255) NOT NULL,
  role character varying(30) DEFAULT 'customer'::character varying NOT NULL,
  remember_token character varying(100),
  created_at timestamp without time zone,
  updated_at timestamp without time zone,
  phone character varying(40),
  address character varying(500),
  is_active boolean DEFAULT true NOT NULL,
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- storefront.admin_audit_logs
CREATE TABLE storefront.admin_audit_logs (
  id bigint DEFAULT nextval('storefront.admin_audit_logs_id_seq'::regclass) NOT NULL,
  actor_user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT admin_audit_logs_pkey PRIMARY KEY (id)
);

-- storefront.catalog_categories
CREATE TABLE storefront.catalog_categories (
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  sort_order smallint DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT catalog_categories_pkey PRIMARY KEY (slug)
);

-- storefront.catalog_prices
CREATE TABLE storefront.catalog_prices (
  product_id character varying(16) NOT NULL,
  price_usd numeric(12,2) NOT NULL,
  price_cdf numeric(16,2) NOT NULL,
  exchange_rate numeric(12,2) DEFAULT 2800 NOT NULL,
  price_confirmed boolean DEFAULT false NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT catalog_prices_pkey PRIMARY KEY (product_id),
  CONSTRAINT catalog_prices_price_cdf_check CHECK ((price_cdf > (0)::numeric)),
  CONSTRAINT catalog_prices_price_usd_check CHECK ((price_usd > (0)::numeric))
);

-- storefront.catalog_products
CREATE TABLE storefront.catalog_products (
  product_id text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  brand text NOT NULL,
  category text NOT NULL,
  category_slug text NOT NULL,
  description text DEFAULT ''::text NOT NULL,
  image_url text NOT NULL,
  badge text,
  specifications jsonb DEFAULT '[]'::jsonb NOT NULL,
  featured boolean DEFAULT false NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT catalog_products_pkey PRIMARY KEY (product_id),
  CONSTRAINT catalog_products_slug_key UNIQUE (slug)
);

-- storefront.order_items
CREATE TABLE storefront.order_items (
  id bigint DEFAULT nextval('storefront.order_items_id_seq'::regclass) NOT NULL,
  order_id bigint NOT NULL,
  product_id character varying(16) NOT NULL,
  product_slug character varying(160) NOT NULL,
  product_name character varying(255) NOT NULL,
  brand character varying(120) NOT NULL,
  quantity integer NOT NULL,
  unit_price_usd numeric(12,2) NOT NULL,
  line_total_usd numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES storefront.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);

-- storefront.orders
CREATE TABLE storefront.orders (
  id bigint DEFAULT nextval('storefront.orders_id_seq'::regclass) NOT NULL,
  reference character varying(40) NOT NULL,
  auth_user_id text NOT NULL,
  customer_name character varying(160) NOT NULL,
  customer_email character varying(255) NOT NULL,
  customer_phone character varying(40) NOT NULL,
  delivery_address character varying(255) NOT NULL,
  delivery_area character varying(120) NOT NULL,
  notes text,
  currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
  exchange_rate numeric(12,2) DEFAULT 2800 NOT NULL,
  subtotal_usd numeric(12,2) NOT NULL,
  total_usd numeric(12,2) NOT NULL,
  total_cdf numeric(16,2) NOT NULL,
  status character varying(40) DEFAULT 'pending_confirmation'::character varying NOT NULL,
  payment_method character varying(40) DEFAULT 'cash_in_person'::character varying NOT NULL,
  payment_status character varying(40) DEFAULT 'unpaid'::character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_reference_key UNIQUE (reference)
);

CREATE INDEX inventory_product_created_index ON public.inventory_movements USING btree (product_id, created_at);
CREATE INDEX orders_status_index ON public.orders USING btree (status);
CREATE INDEX orders_payment_status_index ON public.orders USING btree (payment_status);
CREATE INDEX products_category_active_index ON public.products USING btree (category_id, is_active);
CREATE INDEX products_featured_index ON public.products USING btree (is_featured);
CREATE INDEX storefront_order_items_order_idx ON public.storefront_order_items USING btree (order_id);
CREATE INDEX storefront_orders_user_created_idx ON public.storefront_orders USING btree (auth_user_id, created_at DESC);
CREATE INDEX catalog_products_active_category_idx ON storefront.catalog_products USING btree (is_active, category_slug);
CREATE INDEX storefront_order_items_order_idx ON storefront.order_items USING btree (order_id);
CREATE INDEX storefront_orders_user_created_idx ON storefront.orders USING btree (auth_user_id, created_at DESC);


COMMIT;

-- Liens logiques sans FK : catalog_prices.product_id -> catalog_products.product_id ;
-- catalog_products.category_slug -> catalog_categories.slug ; orders.auth_user_id et
-- admin_audit_logs.actor_user_id correspondent aux identifiants Neon Auth.
