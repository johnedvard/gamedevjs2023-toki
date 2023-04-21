import { connect, keyStores, WalletConnection, Contract } from 'near-api-js';
import { getConfig } from './nearConfig';

export const APP_PREFIX = 'toki';

let walletConnection: WalletConnection;
let contract: Contract;
let accountId: string;
let nearConfig = getConfig();

export const isSignedIn = () => {
  return walletConnection && walletConnection.isSignedIn();
};

// Initialize contract & set global variables
export const initContract = async () => {
  // Initialize connection to the NEAR testnet
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const near = await connect({ ...nearConfig, keyStore });

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  walletConnection = new WalletConnection(near, APP_PREFIX);

  // Getting the Account ID. If still unauthorized, it's just empty string
  accountId = walletConnection.getAccountId();

  // Initializing our contract APIs by contract name and configuration
  contract = await new Contract(walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['nft_tokens_for_owner', 'nft_tokens_by_series', 'get_skins', 'get_equipped_skin'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['nft_buy', 'equip_skin'],
  });

  return walletConnection;
};

export const logout = () => {
  walletConnection.signOut();
  // reload page
};
export const login = () => {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  walletConnection.requestSignIn({ contractId: nearConfig.contractName });
};

export const getSkins = () => {
  return contract['get_skins']();
};
export const equipSkin = (skin: string) => {
  return contract['equip_skin']({ skin });
};
export const getEquippedSkin = () => {
  return contract['get_equipped_skin']();
};

export const nft_tokens_for_owner = (account_id: string) => {
  return contract['nft_tokens_for_owner']({ account_id });
};

export const nft_tokens_by_series = (token_series_id: string) => {
  return contract['nft_tokens_by_series']({ token_series_id });
};

export const nft_buy = ({ token_series_id, priceInYoctoNear }) => {
  return contract['nft_buy'](
    {
      owner_id: accountId,
      receiver_id: accountId,
      token_series_id,
    },
    '300000000000000',
    priceInYoctoNear
  );
};
