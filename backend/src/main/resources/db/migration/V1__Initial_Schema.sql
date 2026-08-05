-- Create USERS table with new schema
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    otp_verified BOOLEAN NOT NULL DEFAULT false,
    zone_id BIGINT,
    manager_id BIGINT,
    dispatcher_id BIGINT,
    manager_email VARCHAR(255),
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP,
    recovery_token VARCHAR(255),
    recovery_token_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_dispatcher FOREIGN KEY (dispatcher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_enabled ON users(enabled);
CREATE INDEX idx_users_zone_id ON users(zone_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_users_dispatcher_id ON users(dispatcher_id);
