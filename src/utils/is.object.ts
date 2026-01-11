/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function isObject(value: unknown): value is object {
  return (
    typeof value === 'object' && !(value instanceof Array) && value !== null
  )
}
