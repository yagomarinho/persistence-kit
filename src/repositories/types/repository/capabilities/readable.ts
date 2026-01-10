/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Repository } from '../contracts'

/**
 * Narrows a Repository type to its read-capable surface.
 *
 * Extracts only the read (get) operation from the repository methods,
 * while preserving repository identity and metadata.
 *
 * Useful in contexts where entities should only be retrieved
 * and not modified.
 */

export type Readable<R extends Repository> =
  R extends Repository<infer E, infer T>
    ? Omit<Repository<E, T>, 'methods'> & {
        readonly methods: {
          readonly get: R['methods']['get']
        }
      }
    : never
