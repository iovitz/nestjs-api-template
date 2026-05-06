-- Account table schema
CREATE TABLE IF NOT EXISTS account (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(10) NOT NULL,
    email VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status INTEGER DEFAULT 0 NOT NULL,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for email lookup
CREATE INDEX IF NOT EXISTS idx_account_email ON account(email);

-- Index for status filter
CREATE INDEX IF NOT EXISTS idx_account_status ON account(status);
