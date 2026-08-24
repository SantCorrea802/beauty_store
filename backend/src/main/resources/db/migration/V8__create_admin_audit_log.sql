create table admin_audit_log (
                                 id_audit_log bigserial primary key,

                                 actor_user_id bigint references usuario_admin(id_usuario),
                                 actor_email varchar(180) not null,

                                 action varchar(80) not null,
                                 entity_type varchar(80) not null,
                                 entity_id bigint,

                                 summary varchar(500) not null,

                                 created_at timestamp with time zone not null default now()
);

create index idx_admin_audit_log_created_at
    on admin_audit_log (created_at desc);

create index idx_admin_audit_log_entity
    on admin_audit_log (entity_type, entity_id);

create index idx_admin_audit_log_actor_email
    on admin_audit_log (actor_email);

create index idx_admin_audit_log_actor_user
    on admin_audit_log (actor_user_id);