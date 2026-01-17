/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MongoClient, MongoClientOptions } from 'mongodb'
import { Entity } from '@yagomarinho/domain-kernel'

import { Repository, RepositoryResult } from '../../contracts'

/**
 * Resource identifier for MongoDB repositories.
 *
 * Used to discriminate MongoDB repository implementations
 * from other repository types at runtime.
 */

export const MongoRepositoryURI = 'mongo.repo'
export type MongoRepositoryURI = typeof MongoRepositoryURI

/**
 * MongoRepository interface.
 *
 * Represents a repository that manages entities in a MongoDB collection,
 * providing full CRUD and batch operations, as well as connection
 * lifecycle management.
 *
 * - E: the entity type stored in the repository
 */

export interface MongoRepository<E extends Entity> extends Repository<
  E,
  MongoRepositoryURI
> {
  /**
   * Infrastructure methods for managing the underlying MongoDB connection.
   *
   * Includes utilities to create clients, connect, disconnect, and clear
   * collections.
   */

  readonly infra: Readonly<{
    /** Create a new MongoClient instance from a URI */
    createClient: (
      uri: string,
      options?: MongoClientOptions,
    ) => RepositoryResult<MongoClient>

    /** Connects to the MongoDB collection */
    connect: () => RepositoryResult<void>

    /** Disconnects from the MongoDB collection */
    disconnect: () => RepositoryResult<void>

    /** Clears (drops) the collection */
    clear: () => RepositoryResult<void>
  }>
}
