-- Drop if exists and create users table
drop table if exists users cascade;

create extension if not exists "uuid-ossp";

create table users (
    id uuid primary key default uuid_generate_v4(),
    phone varchar not null unique,
    password_hash varchar not null,
    role varchar default 'user'
);

-- Example admin (replace hash with generated bcrypt hash)
-- insert into users (phone, password_hash, role) values ('05394870058', '$2b$10$G3zH0zmtK8E8KfzDJ2LxTOEoQWZCfJ0fP4QMB4e29a9sO12gvcl2O', 'admin');
