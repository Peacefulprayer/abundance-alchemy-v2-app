-- Staging compatibility update — November 17, 2026
-- Target ONLY: iamprs4i_aa_staging. Existing rows and account totals are preserved.
-- Back up files/database first. Existing legacy reset links require a fresh request after app upgrade.
-- MySQL 5.7 syntax: prepared conditional ALTERs; safe to repeat.
USE `iamprs4i_aa_staging`;

SET @aa_ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='iamprs4i_aa_staging' AND TABLE_NAME='user_affirmations' AND COLUMN_NAME='category')=0, 'ALTER TABLE `iamprs4i_aa_staging`.`user_affirmations` ADD COLUMN `category` VARCHAR(255) NULL', 'SELECT 1');
PREPARE aa_stmt FROM @aa_ddl;
EXECUTE aa_stmt;
DEALLOCATE PREPARE aa_stmt;

SET @aa_ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='iamprs4i_aa_staging' AND TABLE_NAME='password_resets' AND COLUMN_NAME='email')=0, 'ALTER TABLE `iamprs4i_aa_staging`.`password_resets` ADD COLUMN `email` VARCHAR(255) NULL', 'SELECT 1');
PREPARE aa_stmt FROM @aa_ddl;
EXECUTE aa_stmt;
DEALLOCATE PREPARE aa_stmt;

SET @aa_ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='iamprs4i_aa_staging' AND TABLE_NAME='password_resets' AND COLUMN_NAME='token_hash')=0, 'ALTER TABLE `iamprs4i_aa_staging`.`password_resets` ADD COLUMN `token_hash` CHAR(64) NULL', 'SELECT 1');
PREPARE aa_stmt FROM @aa_ddl;
EXECUTE aa_stmt;
DEALLOCATE PREPARE aa_stmt;

SET @aa_ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='iamprs4i_aa_staging' AND TABLE_NAME='password_resets' AND COLUMN_NAME='requested_ip')=0, 'ALTER TABLE `iamprs4i_aa_staging`.`password_resets` ADD COLUMN `requested_ip` VARCHAR(64) NULL', 'SELECT 1');
PREPARE aa_stmt FROM @aa_ddl;
EXECUTE aa_stmt;
DEALLOCATE PREPARE aa_stmt;

SET @aa_ddl = IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='iamprs4i_aa_staging' AND TABLE_NAME='password_resets' AND COLUMN_NAME='used_at')=0, 'ALTER TABLE `iamprs4i_aa_staging`.`password_resets` ADD COLUMN `used_at` DATETIME NULL', 'SELECT 1');
PREPARE aa_stmt FROM @aa_ddl;
EXECUTE aa_stmt;
DEALLOCATE PREPARE aa_stmt;

SET @aa_ddl = IF((SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='iamprs4i_aa_staging' AND TABLE_NAME='password_resets' AND COLUMN_NAME='token')='NO', 'ALTER TABLE `iamprs4i_aa_staging`.`password_resets` MODIFY COLUMN `token` CHAR(64) NULL', 'SELECT 1');
PREPARE aa_stmt FROM @aa_ddl;
EXECUTE aa_stmt;
DEALLOCATE PREPARE aa_stmt;

SET @aa_ddl = IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='iamprs4i_aa_staging' AND TABLE_NAME='password_resets' AND INDEX_NAME='idx_password_resets_token_hash')=0, 'ALTER TABLE `iamprs4i_aa_staging`.`password_resets` ADD INDEX `idx_password_resets_token_hash` (`token_hash`)', 'SELECT 1');
PREPARE aa_stmt FROM @aa_ddl;
EXECUTE aa_stmt;
DEALLOCATE PREPARE aa_stmt;

-- Additive migration; no existing account or content records are changed.
CREATE TABLE IF NOT EXISTS `iamprs4i_aa_staging`.`user_gratitude_logs` (
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

-- Additive event ledger for idempotent, concurrent practice completion saves.
-- Existing progress remains the baseline; no account totals are reset.
CREATE TABLE IF NOT EXISTS `iamprs4i_aa_staging`.`user_practice_completions` (
  user_id INT NOT NULL,
  client_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  completed_at DATETIME(3) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, client_id),
  KEY idx_completion_user_date (user_id, completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT DATABASE() AS selected_database, 'Staging schema update complete' AS result;
