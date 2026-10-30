import * as migration_20261030_111247_initial from './20261030_111247_initial';
import * as migration_20261030_121930_add_blob_storage_fields from './20261030_121930_add_blob_storage_fields';
import * as migration_20261030_123940_add_projects from './20261030_123940_add_projects';

export const migrations = [
  {
    up: migration_20261030_111247_initial.up,
    down: migration_20261030_111247_initial.down,
    name: '20261030_111247_initial',
  },
  {
    up: migration_20261030_121930_add_blob_storage_fields.up,
    down: migration_20261030_121930_add_blob_storage_fields.down,
    name: '20261030_121930_add_blob_storage_fields',
  },
  {
    up: migration_20261030_123940_add_projects.up,
    down: migration_20261030_123940_add_projects.down,
    name: '20261030_123940_add_projects'
  },
];
