/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CreateMetaParams,
  DraftEntity,
  Entity,
  EntityMeta,
  EntityURIS,
  Idempotent,
  Resolvable,
  VersionOfEntity,
} from '@yagomarinho/domain-kernel'

/**
 * Parameters used to create entity metadata.
 *
 * Represents the minimal and optional inputs required
 * to initialize or restore an entity's metadata.
 *
 * - id: optional explicit entity identifier
 * - created_at: optional creation timestamp (used when rehydrating entities)
 * - updated_at: optional last update timestamp
 * - idempotency_key: stable key used to ensure idempotent creation
 */

export type ExtendedCreateMetaParams<T extends EntityURIS> = Omit<
  CreateMetaParams<T>,
  'idempotency_key'
> &
  Partial<Idempotent>

/**
 * Entity context facade.
 *
 * Provides controlled, infrastructure-agnostic operations
 * related to the entity lifecycle.
 *
 * This facade is responsible for:
 * - metadata creation and resolution
 * - entity declaration and materialization
 * - structural and identity validation
 *
 * It centralizes cross-cutting concerns required by
 * entity construction without leaking persistence
 * or transport details into the domain.
 */

export interface LifecycleManager {
  /**
   * Create and resolve entity metadata.
   *
   * Combines provided metadata inputs with system-defined
   * defaults and invariants to produce a resolvable
   * EntityMeta instance.
   */
  createMeta: <T extends EntityURIS>(
    data: ExtendedCreateMetaParams<T>,
  ) => Resolvable<EntityMeta<T, VersionOfEntity<T>>>

  /**
   * Declare and materialize an entity.
   *
   * Transforms a draft entity into a fully declared
   * and resolved entity, enforcing identity and
   * structural constraints.
   */
  declareEntity: <E extends Entity>(entity: DraftEntity<E>) => Resolvable<E>

  /**
   * Validate an entity draft.
   *
   * Performs structural and identity validation without
   * materializing or mutating the entity.
   *
   * Acts as a type guard, allowing safe narrowing from
   * DraftEntity<E> to E when validation succeeds.
   */
  validateEntity: <E extends Entity>(entity: DraftEntity<E>) => entity is E

  setIdempotencyKey: (key?: string) => void
}
