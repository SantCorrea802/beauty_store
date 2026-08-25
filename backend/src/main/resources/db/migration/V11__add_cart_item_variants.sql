ALTER TABLE carrito_item
    ADD COLUMN id_variante BIGINT;

ALTER TABLE carrito_item
    ADD CONSTRAINT fk_carrito_item_variante
        FOREIGN KEY (id_variante)
            REFERENCES producto_variante(id_variante)
            ON DELETE SET NULL;

ALTER TABLE carrito_item
DROP CONSTRAINT IF EXISTS uq_carrito_item_carrito_producto;

CREATE INDEX idx_carrito_item_variante
    ON carrito_item(id_variante);

CREATE UNIQUE INDEX uq_carrito_item_producto_sin_variante
    ON carrito_item(id_carrito, id_producto)
    WHERE id_variante IS NULL;

CREATE UNIQUE INDEX uq_carrito_item_producto_con_variante
    ON carrito_item(id_carrito, id_producto, id_variante)
    WHERE id_variante IS NOT NULL;