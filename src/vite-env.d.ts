/// <reference types="vite/client" />

import { GameMode } from './types/GameMode';
import { NearNet } from './types/NearNet';

interface ImportMetaEnv {
  readonly VITE_MODE: GameMode;
  readonly VITE_NEAR_NET: NearNet;
  // more env variables...
}
