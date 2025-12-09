/**
 * Default Custom Field Lists (CFLs)
 * 
 * System-default CFLs that are created for each tenant on initialization.
 * These provide immediate value without requiring configuration.
 */

import { CustomFieldList, CustomFieldDefinition } from '@/domain/entities/custom-field-list';

export interface DefaultCFLConfig {
  name: string;
  fields: CustomFieldDefinition[];
}

/**
 * Standard Arrival Weigh CFL
 * Auto-attached to Batch type: Arrival
 */
export const arrivalCFL: DefaultCFLConfig = {
  name: 'Standard Arrival Weigh',
  fields: [
    {
      field_id: 'arrival_source_farm',
      label: 'Source Farm',
      data_type: 'text',
      is_required: true,
    },
    {
      field_id: 'arrival_truck_reg',
      label: 'Truck Registration',
      data_type: 'text',
      is_required: true,
    },
    {
      field_id: 'arrival_driver',
      label: 'Driver Name',
      data_type: 'text',
      is_required: false,
    },
    {
      field_id: 'arrival_condition',
      label: 'Arrival Condition Score',
      data_type: 'select',
      is_required: true,
      options: [
        { value: '1', label: '1 - Poor' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5 - Average' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9 - Excellent' },
      ],
    },
    {
      field_id: 'arrival_withholding',
      label: 'Withholding Complete',
      data_type: 'boolean',
      is_required: true,
      default_value: false,
    },
    {
      field_id: 'arrival_group_id',
      label: 'Arrival Group ID',
      data_type: 'text',
      is_required: false,
    },
  ],
};

/**
 * Standard Routine Weigh CFL
 * Auto-attached to Batch type: Routine
 * 
 * UPDATED: Includes feed_type, medication, and notes fields for feed comparison and medical records
 */
export const routineCFL: DefaultCFLConfig = {
  name: 'Standard Routine Weigh',
  fields: [
    {
      field_id: 'routine_feed_phase',
      label: 'Feed Phase',
      data_type: 'select',
      is_required: true,
      options: [
        { value: 'Starter', label: 'Starter' },
        { value: 'Grower', label: 'Grower' },
        { value: 'Finisher', label: 'Finisher' },
        { value: 'Pasture', label: 'Pasture' },
        { value: 'Custom', label: 'Custom' },
      ],
    },
    {
      field_id: 'routine_feed_type',
      label: 'Feed Type',
      data_type: 'select',
      is_required: false,
      options: [
        { value: 'Starter', label: 'Starter' },
        { value: 'Grower', label: 'Grower' },
        { value: 'Finisher', label: 'Finisher' },
        { value: 'Pasture', label: 'Pasture' },
        { value: 'Custom', label: 'Custom' },
      ],
    },
    {
      field_id: 'routine_feed_brand',
      label: 'Feed Brand',
      data_type: 'text',
      is_required: false,
    },
    {
      field_id: 'routine_days_on_feed',
      label: 'Days on Feed',
      data_type: 'number',
      is_required: false,
      // Note: This can be auto-calculated from transaction history
    },
    {
      field_id: 'routine_health_status',
      label: 'Health Status',
      data_type: 'select',
      is_required: true,
      options: [
        { value: 'Normal', label: 'Normal' },
        { value: 'Suspect', label: 'Suspect' },
        { value: 'Treated', label: 'Treated' },
        { value: 'Recovering', label: 'Recovering' },
      ],
    },
    {
      field_id: 'routine_treatment_code',
      label: 'Treatment Code',
      data_type: 'text',
      is_required: false,
      // Conditional: Required if health_status !== 'Normal'
    },
    {
      field_id: 'routine_medication',
      label: 'Medication',
      data_type: 'text',
      is_required: false,
    },
    {
      field_id: 'routine_medication_date',
      label: 'Medication Date',
      data_type: 'date',
      is_required: false,
    },
    {
      field_id: 'routine_notes',
      label: 'Notes',
      data_type: 'text',
      is_required: false,
    },
  ],
};

/**
 * Shipment / Auction Weigh CFL
 * Auto-attached to Batch type: Shipment or Auction
 */
export const shipmentCFL: DefaultCFLConfig = {
  name: 'Shipment / Auction Weigh',
  fields: [
    {
      field_id: 'ship_sale_type',
      label: 'Sale Type',
      data_type: 'select',
      is_required: true,
      options: [
        { value: 'Auction', label: 'Auction' },
        { value: 'Direct', label: 'Direct' },
        { value: 'Abattoir', label: 'Abattoir' },
        { value: 'Private', label: 'Private' },
      ],
    },
    {
      field_id: 'ship_buyer_name',
      label: 'Buyer Name',
      data_type: 'text',
      is_required: true,
    },
    {
      field_id: 'ship_contract_id',
      label: 'Contract ID',
      data_type: 'text',
      is_required: false,
    },
    {
      field_id: 'ship_grade',
      label: 'Grade/Classification',
      data_type: 'select',
      is_required: false,
      options: [
        { value: 'Prime', label: 'Prime' },
        { value: 'Choice', label: 'Choice' },
        { value: 'Select', label: 'Select' },
        { value: 'Standard', label: 'Standard' },
      ],
    },
    {
      field_id: 'ship_withdrawal_check',
      label: 'Withdrawal Period Check',
      data_type: 'boolean',
      is_required: true,
      default_value: false,
    },
  ],
};

/**
 * Get default CFL configuration by batch type
 */
export function getDefaultCFLForBatchType(
  batchType: 'Arrival' | 'Routine' | 'Shipment' | 'Auction' | 'Other'
): DefaultCFLConfig | null {
  switch (batchType) {
    case 'Arrival':
      return arrivalCFL;
    case 'Routine':
      return routineCFL;
    case 'Shipment':
    case 'Auction':
      return shipmentCFL;
    default:
      return null;
  }
}

/**
 * All default CFLs
 */
export const defaultCFLs: DefaultCFLConfig[] = [arrivalCFL, routineCFL, shipmentCFL];

