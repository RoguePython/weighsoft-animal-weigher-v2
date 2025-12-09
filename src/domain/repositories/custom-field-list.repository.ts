/**
 * Custom Field List Repository Interface
 * 
 * Defines the contract for CFL data access operations.
 */

import { CustomFieldList } from '../entities/custom-field-list';

export interface ICustomFieldListRepository {
  /**
   * Find CFL by ID
   */
  findById(cflId: string): Promise<CustomFieldList | null>;

  /**
   * Find all CFLs for a tenant
   */
  findAll(tenantId: string): Promise<CustomFieldList[]>;

  /**
   * Find system default CFLs
   */
  findSystemDefaults(tenantId: string): Promise<CustomFieldList[]>;

  /**
   * Create a new CFL
   */
  create(cfl: CustomFieldList): Promise<CustomFieldList>;

  /**
   * Update an existing CFL
   */
  update(cfl: CustomFieldList): Promise<CustomFieldList>;

  /**
   * Delete a CFL (only if not system default)
   */
  delete(cflId: string): Promise<void>;
}

