-- Additive migration; no existing account or content records are changed.
CREATE TABLE IF NOT EXISTS user_gratitude_logs (
  user_id INT NOT NULL,
  client_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  logged_at DATETIME(3) NOT NULL,
  text TEXT NOT NULL,
  focus_area VARCHAR(255) NOT NULL,
  session_type VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, client_id),
  KEY idx_gratitude_user_date (user_id, logged_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
