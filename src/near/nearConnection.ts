import { connect, keyStores, WalletConnection, Contract } from 'near-api-js';
import { getConfig } from './nearConfig';
import { on } from '~/utils/eventEmitterUtils';
import { NearEvent } from '~/enums/NearEvent';

export const APP_PREFIX = 'toki';

export class NearConnection {
  walletConnection;
  contract;
  accountId;
  userName;
  ready; //promise
  nearConfig = getConfig();
  resolveContract;

  constructor() {
    this.listenForGameEvents();
    this.ready = new Promise((resolve) => {
      this.resolveContract = resolve;
    });
  }

  isSignedIn() {
    return this && this.walletConnection && this.walletConnection.isSignedIn();
  }

  // Initialize contract & set global variables
  async initContract() {
    // Initialize connection to the NEAR testnet
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    const near = await connect({ ...this.nearConfig, keyStore });

    // Initializing Wallet based Account. It can work with NEAR testnet wallet that
    // is hosted at https://wallet.testnet.near.org
    this.walletConnection = new WalletConnection(near, APP_PREFIX);

    // Getting the Account ID. If still unauthorized, it's just empty string
    this.accountId = this.walletConnection.getAccountId();

    // Initializing our contract APIs by contract name and configuration
    this.contract = await new Contract(this.walletConnection.account(), this.nearConfig.contractName, {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: ['nft_tokens_for_owner', 'nft_tokens_by_series'],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ['nft_buy'],
    });
    this.resolveContract();
    return this.walletConnection;
  }

  logout() {
    this.walletConnection.signOut();
    // reload page
  }
  login() {
    // Allow the current app to make calls to the specified contract on the
    // user's behalf.
    // This works by creating a new access key for the user's account and storing
    // the private key in localStorage.
    this.walletConnection.requestSignIn(this.nearConfig.contractName);
  }

  nft_tokens_for_owner(account_id) {
    return this.contract.nft_tokens_for_owner({ account_id });
  }

  nft_tokens_by_series(token_series_id) {
    return this.contract.nft_tokens_by_series({ token_series_id });
  }
  nft_buy({ token_series_id, priceInYoctoNear }) {
    return this.contract.nft_buy(
      {
        owner_id: this.accountId,
        receiver_id: this.accountId,
        token_series_id,
      },
      '300000000000000',
      priceInYoctoNear
    );
  }

  listenForGameEvents() {
    on(NearEvent.buyNft, ({ token_series_id, priceInYoctoNear }) =>
      this.nft_buy({ token_series_id, priceInYoctoNear })
    );
  }
}
