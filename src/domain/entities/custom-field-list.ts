/**
 * Custom Field List (CFL) Domain Entity
 * 
 * Represents a template for flexible metadata capture in batches.
 */

export type CustomFieldDataType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value: any;
  message?: string;
}

export interface CustomFieldDefinition {
  field_id: string; // Stable identifier
  label: string; // Display name (can change)
  data_type: CustomFieldDataType;
  is_required: boolean;
  default_value?: any;
  options?: SelectOption[]; // For select/multi-select
  validation_rules?: ValidationRule[];
}

export interface CustomFieldList {
  cfl_id: string;
  tenant_id: string;

  // Identity
  name: string;
  version: number;
  is_system_default: boolean;

  // Definition
  fields: CustomFieldDefinition[];

  // Metadata
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by?: string;
}

