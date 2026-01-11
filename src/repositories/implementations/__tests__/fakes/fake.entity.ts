/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createEntity,
  DraftEntity,
  Entity,
  EntityMeta,
} from '@yagomarinho/domain-kernel'
import { concatenate } from '../../../../utils'

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

export function createEn({ name, value, tags }: EnProps): DraftEntity<En>
export function createEn({ name, value, tags }: EnProps, meta: EntityMeta): En
export function createEn(
  { name, value, tags }: EnProps,
  meta?: EntityMeta,
): En {
  return createEntity(
    EnURI,
    EnVersion,
    createEn,
    { name, value, tags },
    meta as any,
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
