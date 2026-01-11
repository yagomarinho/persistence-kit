/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Merge, ValidObject } from '../types-utils'

export function concatenate<A extends ValidObject, B extends ValidObject>(
  a: A,
  b: B,
): Merge<A, B> {
  return {
    ...a,
    ...b,
  }
}
