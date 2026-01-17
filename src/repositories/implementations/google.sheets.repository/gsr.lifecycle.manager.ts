/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createEntityMeta, isEntity } from '@yagomarinho/domain-kernel'
import { GCPCredentials } from './gcp.credentials'
import { GCPAuth, getRowsCount } from './helpers'
import { LifecycleManager } from '../../../lifecycle.managers'

interface ContextProps {
  credentials: GCPCredentials
  spreadsheetId: string
  range: string
}
export function GSRepoLifecycleManager({
  credentials,
  spreadsheetId,
  range,
}: ContextProps): LifecycleManager {
  let _key: string | undefined = undefined

  const setIdempotencyKey: LifecycleManager['setIdempotencyKey'] = key => {
    _key = key
  }

  const validateEntity: LifecycleManager['validateEntity'] = entity =>
    isEntity(entity)

  const createMeta: LifecycleManager['createMeta'] = async ({
    id,
    created_at,
    updated_at,
    idempotency_key,
    tag,
    version,
  }) => {
    const auth = await GCPAuth(credentials)
    const now = new Date()
    return createEntityMeta({
      id: id ?? (await getRowsCount(auth, spreadsheetId, range)).toString(),
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
    createMeta,
    declareEntity,
    validateEntity,
    setIdempotencyKey,
  }
}
