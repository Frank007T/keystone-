ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50);

UPDATE audit_logs
SET status = CASE
    WHEN response_status = 201 THEN 'SUCCESS'
    WHEN response_status = 202 THEN 'PROCESSING'
    WHEN response_status IN (200, 204) THEN 'COMPLETED'
    WHEN response_status IN (400, 401, 403, 404, 500, 502, 503) THEN 'FAILED'
    WHEN response_status IN (409, 422) THEN 'WARNING'
    ELSE 'PENDING'
END
WHERE status IS NULL;
