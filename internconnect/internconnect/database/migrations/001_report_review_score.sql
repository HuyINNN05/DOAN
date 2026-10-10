-- Additive migration for existing databases. Run once; do not import seed again.
ALTER TABLE report_reviews ADD COLUMN score DECIMAL(4,2) NULL AFTER feedback,
  ADD CONSTRAINT chk_report_review_score CHECK (score IS NULL OR (score >= 0 AND score <= 10));
