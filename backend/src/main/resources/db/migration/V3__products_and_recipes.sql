CREATE TABLE product_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (length(trim(name)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX product_categories_name_idx ON product_categories (lower(name));

INSERT INTO product_categories (id, name) VALUES
    ('30000000-0000-0000-0000-000000000001', 'Cakes & Pastries'),
    ('30000000-0000-0000-0000-000000000002', 'Beverages'),
    ('30000000-0000-0000-0000-000000000003', 'Desserts'),
    ('30000000-0000-0000-0000-000000000004', 'Main Dishes'),
    ('30000000-0000-0000-0000-000000000005', 'Snacks');

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (length(trim(name)) > 0),
    description VARCHAR(2000) NOT NULL DEFAULT '',
    category_id UUID NOT NULL REFERENCES product_categories(id),
    selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX products_category_status_idx ON products (category_id, active);
CREATE INDEX products_name_idx ON products (lower(name));

CREATE TABLE recipes (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL UNIQUE REFERENCES products(id),
    yield_quantity NUMERIC(19,6) NOT NULL CHECK (yield_quantity > 0),
    yield_description VARCHAR(120) NOT NULL CHECK (length(trim(yield_description)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Quantities retain the explicitly chosen compatible unit; stock units are fixed in inventory.
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    quantity NUMERIC(19,6) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(16) NOT NULL CHECK (unit IN ('G', 'KG', 'ML', 'L', 'PCS')),
    CONSTRAINT recipe_ingredients_unique UNIQUE (recipe_id, ingredient_id)
);
CREATE INDEX recipe_ingredients_ingredient_idx ON recipe_ingredients (ingredient_id);
