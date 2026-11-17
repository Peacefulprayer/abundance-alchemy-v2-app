-- Additive event ledger for idempotent, concurrent practice completion saves.
-- Existing progress remains the baseline; no account totals are reset.
CREATE TABLE IF NOT EXISTS user_practice_completions (
  user_id INT NOT NULL,
  client_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  completed_at DATETIME(3) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, client_id),
  KEY idx_completion_user_date (user_id, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
