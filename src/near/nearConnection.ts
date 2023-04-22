const mode = import.meta.env.VITE_MODE || 'testnet';

import { connect, keyStores, WalletConnection, Contract } from 'near-api-js';
import { getConfig } from './nearConfig';
import { NftSeriesId } from '~/types/NftSeriesId';
import { setItem } from '~/utils/storageUtils';
import { getItem } from '~/utils/storageUtils';

export const APP_PREFIX = 'toki';

const NFT_SERIES_IDS: { mainnet: Record<NftSeriesId, string>; testnet: Record<NftSeriesId, string> } = {
  mainnet: {
    tokiGreen: '495650',
    tokiRed: '495651',
  },
  testnet: {
    tokiGreen: '2620',
    tokiRed: '2619',
  },
};

let walletConnection: WalletConnection;
let contract: Contract;
let nearConfig = getConfig();

const getAccountId = () => {
  // Getting the Account ID. If still unauthorized, it's just empty string
  return walletConnection.getAccountId();
};

export const getNftSeriesId = (id: NftSeriesId) => {
  return NFT_SERIES_IDS[mode][id];
};
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

  // Initializing our contract APIs by contract name and configuration
  contract = await new Contract(walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['nft_tokens_for_owner', 'nft_tokens_by_series', 'nft_get_series_single'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['nft_buy', 'nft_mint'],
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

export const equipSkin = (skin: string) => {
  setItem('equippedSkin', skin);
};
export const getEquippedSkinName = () => {
  return getItem('equippedSkin') || 'blue';
};

export const nftTokensForOwner = (account_id?: string) => {
  if (!account_id) account_id = getAccountId();
  return contract['nft_tokens_for_owner']({ account_id });
};

/**
 * Check if owns NFT in series
 */
export const nftTokensBySeries = (token_series_id: string) => {
  return contract['nft_tokens_by_series']({ token_series_id });
};
/**
 * Check info of NFT in series
 */
export const nftGetSeriesSingle = (token_series_id: string) => {
  return contract['nft_get_series_single']({ token_series_id });
};

export const nftMint = ({ token_series_id }) => {
  return contract['nft_mint'](
    {
      owner_id: getAccountId(),
      receiver_id: getAccountId(),
      token_series_id,
    },
    '300000000000000'
  );
};
export const nftBuy = ({ token_series_id, priceInYoctoNear }) => {
  return contract['nft_buy'](
    {
      owner_id: getAccountId(),
      receiver_id: getAccountId(),
      token_series_id,
    },
    '300000000000000',
    priceInYoctoNear
  );
};
