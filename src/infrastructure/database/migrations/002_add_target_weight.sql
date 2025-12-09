-- Migration: Add target_weight_kg to entities table
-- Version: 002
-- Date: 2024-12-09
-- Description: Adds target_weight_kg column to entities table for tracking target weights per animal

-- Add target_weight_kg column to entities table
ALTER TABLE entities ADD COLUMN target_weight_kg REAL;

-- Create index for efficient queries on target weight
CREATE INDEX idx_entities_target_weight ON entities(tenant_id, target_weight_kg) WHERE target_weight_kg IS NOT NULL;

