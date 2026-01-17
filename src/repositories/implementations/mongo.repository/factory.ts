/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Entity, Identifiable } from '@yagomarinho/domain-kernel'
import { Collection, Document, MongoClient, MongoClientOptions } from 'mongodb'

import { QueryBuilder, Repository } from '../../contracts'
import { CONNECTION_STATUS } from './connection.status'
import { fromDocument, isConnected, mongoId, toDocument } from './helpers'
import { MongoClientConfig, MongoWithURIConfig } from './mongo.client.config'
import { mongoEntityLifecycleManager } from './mongo.entity.lifecycle.manager'
import { MongoRepository, MongoRepositoryURI } from './mongo.repository'
import { applySorts, whereAdaptToFindQuery } from './query'

/**
 * Factory function for creating a MongoDB-backed repository.
 *
 * Supports two configuration modes:
 * - MongoClientConfig: uses a pre-existing MongoClient
 * - MongoWithURIConfig: creates a MongoClient from a URI
 *
 * Returns a repository with standard CRUD methods (`get`, `set`, `remove`,
 * `query`, `batch`) and `infra` methods for connection management.
 *
 * - E: the entity type managed by the repository
 */

export function createMongoRepository<E extends Entity>(
  config: MongoClientConfig<E>,
): MongoRepository<E>
export function createMongoRepository<E extends Entity>(
  config: MongoWithURIConfig<E>,
): MongoRepository<E>
export function createMongoRepository<E extends Entity>({
  database,
  collection,
  converter,
  projection,
  tag,
  lifecycleManager = mongoEntityLifecycleManager(),
  ...rest
}: MongoClientConfig<E> | MongoWithURIConfig<E>): MongoRepository<E> {
  const client: MongoClient =
    (rest as any).client ?? new MongoClient((rest as any).uri)
  let coll: Collection<Document>
  let status = CONNECTION_STATUS.READY

  const connect: MongoRepository<E>['infra']['connect'] = async () => {
    if (status !== CONNECTION_STATUS.READY)
      throw new Error('Connection has been initialized')

    if (await isConnected(client)) {
      status = CONNECTION_STATUS.CONNECTED
      coll = client.db(database).collection(collection)

      return
    }

    const connection = await client.connect()

    coll = connection.db(database).collection(collection)
    status = CONNECTION_STATUS.CONNECTED
  }

  const disconnect = verifyConnectionProxy<
    MongoRepository<E>['infra']['disconnect']
  >(async () => {
    await client.close()
    status = CONNECTION_STATUS.DISCONNECTED
  })

  const get = verifyConnectionProxy<Repository<E>['methods']['get']>(
    async id => {
      try {
        const item = await coll.findOne({ _id: mongoId(id) }, { projection })

        if (item === null) return

        return converter.from(fromDocument(item))
      } catch {
        return
      }
    },
  )

  const set = verifyConnectionProxy<Repository<E>['methods']['set']>(
    async entity => {
      const e = await lifecycleManager.declareEntity(entity)

      const { _id, ...props } = toDocument(converter.to(e))

      const result = await coll.updateOne(
        { _id },
        { $set: props },
        { upsert: true },
      )

      const doc = await coll.findOne(
        { _id: result.upsertedId ? result.upsertedId! : _id },
        { projection },
      )

      if (!doc) throw new Error('Internal MongoDB Error')

      return converter.from(fromDocument(doc))
    },
  )

  // idempontecy key makes no difference for hard remove operation
  // but kept for interface consistency and for global id contexts
  const remove = verifyConnectionProxy<Repository<E>['methods']['remove']>(
    async id => {
      await coll.deleteOne({ _id: mongoId(id) })
    },
  )

  const query = verifyConnectionProxy<Repository<E>['methods']['query']>(
    async (q = QueryBuilder<E>().build()) => {
      let find = coll.find(
        q.filter_by && q.filter_by.value
          ? whereAdaptToFindQuery(q.filter_by)
          : {},
      )

      if (typeof q.batch_size === 'number' && q.batch_size !== Infinity) {
        const skip = q.cursor_ref ? parseInt(q.cursor_ref) * q.batch_size : 0
        find = find.limit(q.batch_size + 1).skip(skip)
      }

      if (q.order_by && q.order_by.length) {
        find = find.sort(applySorts(q.order_by))
      }

      if (projection) find.project(projection)

      let data = (await find.toArray()).map(doc =>
        converter.from(fromDocument(doc)),
      )

      let next_cursor: string | undefined = undefined

      if (data.length === q.batch_size + 1) {
        data = data.slice(0, -1)
        next_cursor = (
          (q.cursor_ref ? parseInt(q.cursor_ref) : 0) + 1
        ).toString()
      }

      return {
        data,
        next_cursor,
      }
    },
  )

  const batch = verifyConnectionProxy<Repository<E>['methods']['batch']>(
    async b => {
      const upserted_ids: Identifiable[] = []
      const removed_ids: Identifiable[] = []
      const bulk = await Promise.all(
        b.map(async item => {
          if (item.type === 'remove') {
            removed_ids.push({ id: item.data })
            return {
              deleteOne: {
                filter: { _id: mongoId(item.data) },
              },
            }
          }

          const e = await lifecycleManager.declareEntity(item.data)

          const { _id, ...props } = toDocument(converter.to(e))

          upserted_ids.push({ id: _id.toString() })

          return {
            updateOne: {
              filter: { _id },
              update: { $set: props },
              upsert: true,
            },
          }
        }),
      )

      const result = await coll.bulkWrite(bulk, { ordered: false })

      return {
        status: result.isOk() ? 'successful' : 'failed',
        time: new Date(),
        upserted_ids,
        removed_ids,
      }
    },
  )

  const clear = verifyConnectionProxy<MongoRepository<E>['infra']['clear']>(
    async () => {
      await coll.drop()
    },
  )

  const createClient = (uri: string, options?: MongoClientOptions) =>
    new MongoClient(uri, options)

  function verifyConnectionProxy<F extends (...args: any[]) => any>(
    fn: F,
  ): (...args: Parameters<F>) => ReturnType<F> {
    return (...args) => {
      if (status !== CONNECTION_STATUS.CONNECTED)
        throw new Error('connection not established')

      return fn(...args)
    }
  }

  return {
    tag,
    meta: {
      resource: 'repository',
      tag: MongoRepositoryURI,
    },
    methods: {
      get,
      set,
      remove,
      query,
      batch,
    },
    infra: {
      createClient,
      connect,
      disconnect,
      clear,
    },
  }
}
