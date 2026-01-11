/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Entity } from '@yagomarinho/domain-kernel'
import { Repository } from '../repository'
import { FederatedRemover, FederatedSearcher, FederatedSetter } from './methods'

/*
 * Federated repository URI.
 *
 * Identifies the federated repository implementation
 * within the repository resolution system.
 */
export const FedetaredURI = 'federated.repository'
export type FedetaredURI = typeof FedetaredURI

/**
 * Federated repository contract.
 *
 * Represents a repository abstraction that operates
 * over one or more federated data sources.
 *
 * This repository:
 * - preserves the standard repository read/write surface
 * - replaces core mutation and query operations with
 *   federated-capable counterparts
 * - is identified by a dedicated repository URI
 *
 * The concrete federation model (routing, aggregation,
 * replication, consistency or conflict resolution)
 * is intentionally left to the implementation.
 *
 * - E: base entity type managed by the repository
 * - T: tag used to identify concrete entity variants
 */

export interface FederatedRepository<
  E extends Entity,
  T extends string = string,
> extends Repository<E, FedetaredURI, T> {
  /**
   * Federated repository methods.
   *
   * Overrides selected repository operations with
   * federated-aware variants while preserving the
   * remaining repository surface.
   */
  methods: Omit<Repository<E>['methods'], 'set' | 'query'> & {
    /**
     * Federated write operation.
     *
     * Persists or propagates entity drafts across
     * federated targets using idempotent semantics.
     */
    set: FederatedSetter<E>

    /**
     * Federated remove operation.
     *
     * Removes entities across federated targets
     * using idempotent semantics.
     */
    remove: FederatedRemover

    /**
     * Federated query operation.
     *
     * Executes read operations across federated
     * sources with optional scoping and tagging.
     */
    query: FederatedSearcher<E>
  }
}
