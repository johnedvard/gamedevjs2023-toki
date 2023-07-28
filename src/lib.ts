import '~/styles.scss';
import { Toki } from './Game';
let toki: Toki;
export const initGame = () => {
  toki = new Toki();
  postMessage({ payload: 'removeLoading' }, '*');
};

export const destroyGame = () => {
  if (toki) toki.destroyGame();
  toki = null;
};
