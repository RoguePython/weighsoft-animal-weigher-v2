/**
 * Animal Group Domain Entity
 * 
 * Represents a group/batch of animals. Animals can belong to multiple groups.
 * This is separate from Batch (weighing sessions).
 */

export interface AnimalGroup {
  group_id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by?: string;
}

