/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createEntityMeta, isEntity } from '@yagomarinho/domain-kernel'

import { LifecycleManager } from '../../../lifecycle.managers'

/**
 * Creates a fake `LifecycleManager` for testing or development purposes.
 *
 * - Generates simple incrementing IDs for entities
 * - Sets `created_at` and `updated_at` to the current timestamp
 * - Provides a basic `isValid` check using `isEntity`
 *
 * Useful for scenarios where a real `LifLifecycleManager` is not available,
 * such as unit tests or local development mocks.
 */

export function createInMemoryLifecycleManager(): LifecycleManager {
  let n = 0
  let _key: string | undefined = undefined

  const setIdempotencyKey: LifecycleManager['setIdempotencyKey'] = key => {
    _key = key
  }

  const validateEntity: LifecycleManager['validateEntity'] = entity =>
    isEntity(entity)

  const createMeta: LifecycleManager['createMeta'] = ({
    id = '',
    created_at,
    updated_at,
    idempotency_key,
    tag,
    version,
  }) => {
    const now = new Date()
    return createEntityMeta({
      id: id ?? (n++).toString(),
      created_at: created_at ?? now,
      updated_at: updated_at ?? now,
      idempotency_key: _key ?? idempotency_key ?? '',
      tag,
      version,
    }) as any
  }

  const declareEntity: LifecycleManager['declareEntity'] = async entity => {
    const metaInit: any = validateEntity(entity)
      ? entity.meta
      : { tag: entity.meta.tag, version: entity.meta.version }

    const meta: any = await createMeta(metaInit)

    return entity.builder(entity.props, meta) as any
  }

  return {
    declareEntity,
    createMeta,
    validateEntity,
    setIdempotencyKey,
  }
}
