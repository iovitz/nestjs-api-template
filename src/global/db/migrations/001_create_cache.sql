-- UNLOGGED table for cache (no WAL, faster writes, no durability needed)
CREATE UNLOGGED TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache (expires_at)
    WHERE expires_at IS NOT NULL;
