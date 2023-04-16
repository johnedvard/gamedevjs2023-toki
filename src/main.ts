import { Toki } from './Game';

const init = () => {
  new Toki();
  postMessage({ payload: 'removeLoading' }, '*');
};

init();
