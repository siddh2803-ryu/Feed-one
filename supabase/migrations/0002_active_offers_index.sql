-- Partial unique index ensuring strictly one pending offer per donation at any time (D22)
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_sent_offer 
ON offers (donation_id) 
WHERE status = 'sent';
