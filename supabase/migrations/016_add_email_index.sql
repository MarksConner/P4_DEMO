-- This migration adds a unique index on the lowercased email column in the users table.
-- LOWER is used to ensure email addresses are treated as case-insensitive so that when a user tries to register with an email that differs only in case from an existing email, it will be caught by the unique index.
-- This is already being handled in the application logic, but this index provides an additional layer of protection at the database level.
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));
