const mode = import.meta.env.VITE_MODE || 'testnet';

// const CONTARCT_NAME_TESTNET = 'dev-1682002125136-89661302505865'; Chandra
// const CONTARCT_NAME_TESTNET = 'dev-1682082438921-24114632800033'; // John
const CONTARCT_NAME_MAINNET = 'marketplace.paras.near';
const CONTARCT_NAME_TESTNET = 'paras-token-v2.testnet';
export const getConfig = () => {
  console.log('mode', mode);
  if (mode === 'mainnet' || mode === 'production') {
    return {
      networkId: 'mainnet',
      nodeUrl: 'https://rpc.mainnet.near.org',
      contractName: CONTARCT_NAME_MAINNET,
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
