/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Entity } from '@yagomarinho/domain-kernel'

import { Repository } from '../../repository'
import { LifecycleManager } from '../../../../lifecycle.managers'

export interface InitializerConfig {
  lifecycleManager: LifecycleManager
}

export interface RepoInitilizer<E extends Entity> {
  (data: InitializerConfig): Repository<E>
}
