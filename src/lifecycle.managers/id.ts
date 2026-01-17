/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CreateDraftEntityMetaInit,
  createEntity,
  createEntityMeta,
  CreateEntityMetaInit,
  DraftEntity,
  Entity,
} from '@yagomarinho/domain-kernel'

export const IDURI = 'id'
export type IDURI = typeof IDURI

export const IDVersion = 'v1'
export type IDVersion = typeof IDVersion

export interface IdProps {
  entity_tag: string
}

export type ID = Entity<IdProps, IDURI, IDVersion>

declare module '@yagomarinho/domain-kernel' {
  interface EntityURItoKind {
    [IDURI]: ID
  }
  interface BuildableURItoKind {
    [IDURI]: ID
  }
}

export function createID(
  props: IdProps,
  meta?: CreateDraftEntityMetaInit<IDURI>,
): DraftEntity<ID>
export function createID(props: IdProps, meta: CreateEntityMetaInit<IDURI>): ID
export function createID(
  { entity_tag }: IdProps,
  {
    id,
    idempotency_key = '',
    created_at,
    updated_at,
  }: Partial<CreateEntityMetaInit<IDURI>> = {},
): DraftEntity<ID> | ID {
  return createEntity(
    IDURI,
    IDVersion,
    createID,
    { entity_tag },
    createEntityMeta({
      id,
      idempotency_key,
      created_at,
      updated_at,
      tag: IDURI,
      version: IDVersion,
    } as any),
  )
}
