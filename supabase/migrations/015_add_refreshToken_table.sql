CREATE TABLE refresh_tokens (
    refresh_token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- UUID for unique token IDs
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- oN DELETE CASCADE to remove tokens when a user is deleted
    token_hash VARCHAR(255) NOT NULL, -- For secure storage of the refresh token (hashed)
    parent_id UUID REFERENCES refresh_tokens(refresh_token_id), -- For token rotation chains
    revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);