/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DraftEntity, Entity } from '@yagomarinho/domain-kernel'

import { RepoInitilizer } from './repo.initializer'
import { ID, LifecycleManager } from '../../../../lifecycle.managers'
import { RepositoryResult } from '../../repository'

export interface IDContext extends LifecycleManager {
  getEntityTag<T extends Entity>(entity: DraftEntity<T>): string
  getIDEntity(id: string): RepositoryResult<ID | undefined>
}

export interface FedConfig<
  U extends RepoInitilizer<any>[],
  T extends string = string,
> {
  repositories: U
  IDContext: IDContext
  tag: T
}
