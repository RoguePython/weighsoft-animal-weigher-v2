-- View: growth_metrics
-- Purpose: Efficient growth calculations with weight changes and days between weighs
-- Used for: ADG calculations, growth tracking, health monitoring

CREATE VIEW IF NOT EXISTS growth_metrics AS
SELECT 
  t.entity_id,
  t.tx_id,
  t.timestamp,
  t.weight_kg,
  LAG(t.weight_kg) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp) AS previous_weight,
  LAG(t.timestamp) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp) AS previous_timestamp,
  t.weight_kg - LAG(t.weight_kg) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp) AS weight_change,
  CAST((julianday(t.timestamp) - julianday(LAG(t.timestamp) OVER (PARTITION BY t.entity_id ORDER BY t.timestamp))) AS REAL) AS days_between
FROM transactions t;

