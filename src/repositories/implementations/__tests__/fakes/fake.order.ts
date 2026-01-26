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

export interface OrderProps {
  value: number
}

export const OrderURI = 'order'
export type OrderURI = typeof OrderURI

export const OrderVersion = 'v1'
export type OrderVersion = typeof OrderVersion

export interface Order extends Entity<OrderProps, OrderURI, OrderVersion> {}

declare module '@yagomarinho/domain-kernel' {
  interface EntityURItoKind {
    [OrderURI]: Order
  }
}

export function createOrder(
  props: OrderProps,
  meta?: CreateDraftEntityMetaInit<OrderURI>,
): DraftEntity<Order>
export function createOrder(
  props: OrderProps,
  meta: CreateEntityMetaInit<OrderURI>,
): Order
export function createOrder(
  { value }: OrderProps,
  {
    id,
    idempotency_key = '',
    updated_at,
    created_at,
  }: Partial<CreateEntityMetaInit<OrderURI>> = {},
): DraftEntity<Order> | Order {
  return createEntity(
    OrderURI,
    OrderVersion,
    createOrder,
    { value },
    createEntityMeta({
      id,
      tag: OrderURI,
      version: OrderVersion,
      idempotency_key,
      updated_at,
      created_at,
    } as any),
  )
}

export function setValue(
  value: number,
  order: DraftEntity<Order>,
): DraftEntity<Order>
export function setValue(value: number, order: Order): Order
export function setValue(
  value: number,
  order: DraftEntity<Order> | Order,
): DraftEntity<Order> | Order {
  return createOrder(concatenate(order.props, { value }), order.meta as any)
}
