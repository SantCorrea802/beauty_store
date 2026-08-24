alter table producto_categoria
drop constraint if exists producto_categoria_id_categoria_fkey;

alter table producto_categoria
    add constraint fk_producto_categoria_categoria
        foreign key (id_categoria)
            references categoria(id_categoria)
            on delete restrict;