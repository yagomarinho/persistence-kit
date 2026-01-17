/*
 * Copyright (c) 2025 Yago Marinho
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { google } from 'googleapis'
import { Entity } from '@yagomarinho/domain-kernel'

import { GSRepoConfig } from './gsr.config'
import { serializeEntity } from './serialize.entity'
import { GSRepoLifecycleManager } from './gsr.lifecycle.manager'
import { Repository, Writable } from '../../contracts'

/**
 * Resource identifier for Google Sheets repositories.
 *
 * Used to discriminate this type of repository from other
 * repository implementations at runtime.
 */

export const GoogleSheetsRepositoryURI = 'google.sheets.repo'
export type GoogleSheetsRepositoryURI = typeof GoogleSheetsRepositoryURI

/**
 * Factory function to create a Google Sheets-backed repository.
 *
 * Provides write-only access to entities using the Google Sheets API.
 * Currently only supports the `set` operation for appending rows.
 *
 * - E: the entity type stored in the repository
 *
 * Parameters:
 * - spreadsheetId: ID of the target Google Sheet
 * - range: cell range within the spreadsheet to operate on
 * - credentials: GCP service account credentials
 * - lifecycleManager: provider for generating entity metadata
 * - tag: entity tag (URI) for type identification
 *
 * Returns:
 * - a repository instance with write-only capabilities
 *   (Writable<Repository<E, GoogleSheetsRepositoryURI>>)
 */

export function GoogleSheetsRepository<E extends Entity>({
  spreadsheetId,
  range,
  credentials,
  lifecycleManager: lf,
  tag,
}: GSRepoConfig<E>): Writable<Repository<E, GoogleSheetsRepositoryURI>> {
  const lifecycleManager =
    lf ?? GSRepoLifecycleManager({ credentials, spreadsheetId, range })
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  })

  const set: Repository<E>['methods']['set'] = async entity => {
    const sheets = google.sheets({ version: 'v4', auth })

    const e = await lifecycleManager.declareEntity(entity)
    const requestBody = {
      values: [serializeEntity(e)],
    }

    // Append the serialized entity values as a new row in the sheet
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody,
    })

    if (!result.data.updates?.updatedRows)
      throw new Error('Invalid data to update')

    // Return the fully built entity with metadata
    return e
  }

  return {
    tag,
    meta: { resource: 'repository', tag: GoogleSheetsRepositoryURI },
    methods: {
      set,
    },
  }
}
