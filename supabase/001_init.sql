-- Produits de base
create table if not exists products (
id uuid primary key default gen_random_uuid(),
id_anda text unique not null,
name text not null,
category text,
brand text,
min_qty int default 1,
lead_time_days int default 0,
thumbnail_url text,
created_at timestamptz default now(),
updated_at timestamptz default now()
);


create table if not exists variants (
sku text primary key,
product_id uuid references products(id) on delete cascade,
color text,
size text,
ean text
);


create table if not exists prices (
id bigserial primary key,
variant_sku text references variants(sku) on delete cascade,
currency text default 'EUR',
qty_break int default 1,
unit_price numeric(12,4) not null
);


create table if not exists assets (
id bigserial primary key,
product_id uuid references products(id) on delete cascade,
url text not null,
type text default 'image'
);


-- Triggers update timestamp
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;


create trigger trg_products_updated
before update on products for each row execute function touch_updated_at();