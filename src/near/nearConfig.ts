// const CONTARCT_NAME_TESTNET = 'dev-1682002125136-89661302505865'; Chandra
const CONTARCT_NAME_TESTNET = 'dev-1682082438921-24114632800033';
export const getConfig = () => {
  return {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    contractName: CONTARCT_NAME_TESTNET,
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
  };
};
