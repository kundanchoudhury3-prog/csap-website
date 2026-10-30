import * as migration_20261030_111247_initial from './20261030_111247_initial';
import * as migration_20261030_121930_add_blob_storage_fields from './20261030_121930_add_blob_storage_fields';
import * as migration_20261030_123940_add_projects from './20261030_123940_add_projects';
import * as migration_20261030_131111_add_gallery from './20261030_131111_add_gallery';
import * as migration_20261030_132906_add_team from './20261030_132906_add_team';
import * as migration_20261030_134522_add_featured_banners from './20261030_134522_add_featured_banners';
import * as migration_20261030_135301_banner_link_optional from './20261030_135301_banner_link_optional';
import * as migration_20261030_140959_add_site_logo from './20261030_140959_add_site_logo';
import * as migration_20261030_141657_add_students_downloads from './20261030_141657_add_students_downloads';

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
    name: '20261030_123940_add_projects',
  },
  {
    up: migration_20261030_131111_add_gallery.up,
    down: migration_20261030_131111_add_gallery.down,
    name: '20261030_131111_add_gallery',
  },
  {
    up: migration_20261030_132906_add_team.up,
    down: migration_20261030_132906_add_team.down,
    name: '20261030_132906_add_team',
  },
  {
    up: migration_20261030_134522_add_featured_banners.up,
    down: migration_20261030_134522_add_featured_banners.down,
    name: '20261030_134522_add_featured_banners',
  },
  {
    up: migration_20261030_135301_banner_link_optional.up,
    down: migration_20261030_135301_banner_link_optional.down,
    name: '20261030_135301_banner_link_optional',
  },
  {
    up: migration_20261030_140959_add_site_logo.up,
    down: migration_20261030_140959_add_site_logo.down,
    name: '20261030_140959_add_site_logo',
  },
  {
    up: migration_20261030_141657_add_students_downloads.up,
    down: migration_20261030_141657_add_students_downloads.down,
    name: '20261030_141657_add_students_downloads'
  },
];
