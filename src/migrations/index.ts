import * as migration_20260301_050330 from './20260301_050330';
import * as migration_20260301_050403 from './20260301_050403';
import * as migration_20260301_051247 from './20260301_051247';
import * as migration_20260301_062322 from './20260301_062322';
import * as migration_20260301_062336 from './20260301_062336';

export const migrations = [
  {
    up: migration_20260301_050330.up,
    down: migration_20260301_050330.down,
    name: '20260301_050330',
  },
  {
    up: migration_20260301_050403.up,
    down: migration_20260301_050403.down,
    name: '20260301_050403',
  },
  {
    up: migration_20260301_051247.up,
    down: migration_20260301_051247.down,
    name: '20260301_051247',
  },
  {
    up: migration_20260301_062322.up,
    down: migration_20260301_062322.down,
    name: '20260301_062322',
  },
  {
    up: migration_20260301_062336.up,
    down: migration_20260301_062336.down,
    name: '20260301_062336'
  },
];
