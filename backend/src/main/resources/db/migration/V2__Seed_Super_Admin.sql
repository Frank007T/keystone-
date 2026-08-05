-- Seed SUPER_ADMIN account
-- Password: TemporaryPassword@123 (BCrypt hashed)
-- This admin must change the password on first login
INSERT INTO users (
    full_name,
    company_name,
    email,
    password,
    phone,
    role,
    enabled,
    otp_verified,
    created_at,
    updated_at
) VALUES (
    'System Administrator',
    'KEYSTONE',
    'admin@keystone.com',
    '$2a$10$N9qo8ucounteq0e3wemv2euxVQqntuLnVJYvxupNc5nWnRrje41Oy',
    '+1-000-0000000',
    'SUPER_ADMIN',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;
