import { NearNet } from '~/types/NearNet';
import { GameMode } from '~/types/GameMode';

const mode: GameMode = import.meta.env.VITE_MODE || 'dev';
const nearNet: NearNet = import.meta.env.VITE_NEAR_NET || 'testnet';

const CONTARCT_NAME_MAINNET = 'x.paras.near';
const CONTARCT_NAME_TESTNET = 'paras-token-v2.testnet';
export const getConfig = () => {
  if (nearNet === 'mainnet' || mode === 'prod') {
    return {
      networkId: 'mainnet',
      nodeUrl: 'https://rpc.mainnet.near.org',
      contractName: CONTARCT_NAME_MAINNET,
      appName: 'Paras Testnet',
      walletUrl: 'https://wallet.near.org',
      helperUrl: 'https://helper.mainnet.near.org',
      explorerUrl: 'https://explorer.mainnet.near.org',
    };
  }
  return {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    contractName: CONTARCT_NAME_TESTNET,
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
  };
};
