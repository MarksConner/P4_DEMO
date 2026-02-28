--Deletes the old unhashed password attribute from the users table, as it is no longer needed and poses a security risk.
ALTER TABLE users
DROP COLUMN password;