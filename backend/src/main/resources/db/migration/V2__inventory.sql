CREATE TABLE ingredients (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (length(trim(name)) > 0),
    category VARCHAR(32) NOT NULL CHECK (category IN ('FLOUR_AND_GRAINS', 'DAIRY_AND_EGGS', 'SUGAR_AND_SWEETENERS', 'FRUIT_AND_VEGETABLES', 'FATS_AND_OILS', 'SPICES_AND_FLAVOURINGS', 'NUTS_AND_SEEDS', 'MEAT_AND_SEAFOOD', 'OTHER')),
    unit VARCHAR(16) NOT NULL CHECK (unit IN ('G', 'KG', 'ML', 'L', 'PCS')),
    storage_location VARCHAR(16) NOT NULL CHECK (storage_location IN ('PANTRY', 'REFRIGERATOR', 'FREEZER')),
    quantity NUMERIC(19,6) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    minimum_stock NUMERIC(19,6) NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ingredients_active_name_idx ON ingredients (lower(trim(name))) WHERE NOT archived;
CREATE INDEX ingredients_storage_idx ON ingredients (storage_location) WHERE NOT archived;
CREATE INDEX ingredients_category_idx ON ingredients (category) WHERE NOT archived;

-- Minimal expiry-bearing receipts, not supplier or advanced batch management.
CREATE TABLE stock_batches (
    id UUID PRIMARY KEY,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    remaining_quantity NUMERIC(19,6) NOT NULL CHECK (remaining_quantity >= 0),
    expiry_date DATE,
    received_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX stock_batches_available_idx ON stock_batches (ingredient_id, expiry_date, received_at) WHERE remaining_quantity > 0;

-- Immutable audit records; quantities and deltas use the ingredient's fixed unit.
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    actor_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(24) NOT NULL CHECK (type IN ('INITIAL_STOCK', 'INTAKE', 'ADJUSTMENT')),
    quantity_delta NUMERIC(19,6) NOT NULL CHECK (quantity_delta <> 0),
    quantity_after NUMERIC(19,6) NOT NULL CHECK (quantity_after >= 0),
    reason VARCHAR(500) NOT NULL CHECK (length(trim(reason)) > 0),
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX inventory_movements_ingredient_idx ON inventory_movements (ingredient_id, created_at DESC);
