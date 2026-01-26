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

export interface UserProps {
  name: string
}

export const UserURI = 'user'
export type UserURI = typeof UserURI

export const UserVersion = 'v1'
export type UserVersion = typeof UserVersion

export interface User extends Entity<UserProps, UserURI, UserVersion> {}

declare module '@yagomarinho/domain-kernel' {
  interface EntityURItoKind {
    [UserURI]: User
  }
}

export function createUser(
  props: UserProps,
  meta?: CreateDraftEntityMetaInit<UserURI>,
): DraftEntity<User>
export function createUser(
  props: UserProps,
  meta: CreateEntityMetaInit<UserURI>,
): User
export function createUser(
  { name }: UserProps,
  {
    id,
    idempotency_key = '',
    created_at,
    updated_at,
  }: Partial<CreateEntityMetaInit<UserURI>> = {},
): any {
  return createEntity(
    UserURI,
    UserVersion,
    createUser,
    { name },
    createEntityMeta({
      id,
      idempotency_key,
      tag: UserURI,
      version: UserVersion,
      created_at,
      updated_at,
    } as any),
  )
}

export function setName(
  name: string,
  user: DraftEntity<User>,
): DraftEntity<User>
export function setName(name: string, user: User): User
export function setName(
  name: string,
  user: DraftEntity<User> | User,
): DraftEntity<User> | User {
  return createUser(concatenate(user.props, { name }), user.meta as any)
}
