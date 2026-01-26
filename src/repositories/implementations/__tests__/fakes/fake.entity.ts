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
import { concatenate } from '@yagomarinho/utils-toolkit/concatenate'

export interface EnProps {
  name: string
  value: number
  tags: string[]
}

export const EnURI = 'En'
export type EnURI = typeof EnURI

export const EnVersion = 'v1'
export type EnVersion = typeof EnVersion

export type En = Entity<EnProps, EnURI, EnVersion>

declare module '@yagomarinho/domain-kernel' {
  interface EntityURItoKind {
    [EnURI]: En
  }
}

export function createEn(
  { name, value, tags }: EnProps,
  meta?: CreateDraftEntityMetaInit<EnURI>,
): DraftEntity<En>
export function createEn(
  { name, value, tags }: EnProps,
  meta: CreateEntityMetaInit<EnURI>,
): En
export function createEn(
  { name, value, tags }: EnProps,
  {
    id,
    idempotency_key = '',
    created_at,
    updated_at,
  }: Partial<CreateEntityMetaInit<EnURI>> = {},
): DraftEntity<En> | En {
  return createEntity(
    EnURI,
    EnVersion,
    createEn,
    { name, value, tags },
    createEntityMeta({
      id,
      idempotency_key,
      tag: EnURI,
      version: EnVersion,
      created_at,
      updated_at,
    } as any),
  )
}

export function setName(name: string, en: DraftEntity<En>): DraftEntity<En>
export function setName(name: string, en: En): En
export function setName(
  name: string,
  en: DraftEntity<En> | En,
): DraftEntity<En> | En {
  return createEn(concatenate(en.props, { name }), en.meta as any)
}
