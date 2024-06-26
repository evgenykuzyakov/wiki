import * as nearAPI from "near-api-js";
import Cookies from "js-cookie";
import { singletonHook } from "react-singleton-hook";
import Big from "big.js";
import { refreshAllowanceObj } from "../App";
import { useEffect, useState } from "react";

export const TGas = Big(10).pow(12);
export const MaxGasPerTransaction = TGas.mul(300);
export const StorageCostPerByte = Big(10).pow(19);
export const TokenStorageDeposit = StorageCostPerByte.mul(125);
export const BridgeTokenStorageDeposit = StorageCostPerByte.mul(1250);

export const randomPublicKey = nearAPI.utils.PublicKey.from(
  "ed25519:8fWHD35Rjd78yeowShh9GwhRudRtLLsGCRjZtgPjAtw9"
);

// const isLocalhost = window.location.hostname === "localhost";

export const IsMainnet = true;
const TestnetContract = "dev-1636746667499-69374496923949";
const TestNearConfig = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  archivalNodeUrl: "https://rpc.testnet.internal.near.org",
  contractName: TestnetContract,
  walletUrl: "https://wallet.testnet.near.org",
  storageCostPerByte: StorageCostPerByte,
  wrapNearAccountId: "wrap.testnet",
};
const MainnetContract = "thewiki.near";
export const MainNearConfig = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
  archivalNodeUrl: "https://rpc.mainnet.internal.near.org",
  contractName: MainnetContract,
  walletUrl: "https://wallet.near.org",
  storageCostPerByte: StorageCostPerByte,
  wrapNearAccountId: "wrap.near",
};

export const NearConfig = IsMainnet ? MainNearConfig : TestNearConfig;
export const LsKey = NearConfig.contractName + ":v01:";

function wrapContract(account, contractId, options) {
  const nearContract = new nearAPI.Contract(account, contractId, options);
  const { viewMethods = [], changeMethods = [] } = options;
  const contract = {
    account,
    contractId,
  };
  viewMethods.forEach((methodName) => {
    contract[methodName] = nearContract[methodName];
  });
  changeMethods.forEach((methodName) => {
    contract[methodName] = async (...args) => {
      try {
        return await nearContract[methodName](...args);
      } catch (e) {
        const msg = e.toString();
        if (msg.indexOf("does not have enough balance") !== -1) {
          return await refreshAllowanceObj.refreshAllowance();
        }
        throw e;
      }
    };
  });
  return contract;
}

async function _initNear() {
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  const nearConnection = await nearAPI.connect(
    Object.assign({ deps: { keyStore } }, NearConfig)
  );
  const _near = {};

  _near.nearArchivalConnection = nearAPI.Connection.fromConfig({
    networkId: NearConfig.networkId,
    provider: {
      type: "JsonRpcProvider",
      args: { url: NearConfig.archivalNodeUrl },
    },
    signer: { type: "InMemorySigner", keyStore },
  });

  _near.keyStore = keyStore;
  _near.nearConnection = nearConnection;

  // TODO: This is a hack, move everything to use web4 directly via REST API
  _near.accountId = Cookies.get('web4_account_id');
  _near.account = await nearConnection.account(_near.accountId);

  _near.contract = wrapContract(_near.account, NearConfig.contractName, {
    viewMethods: [
      "get_num_articles",
      "get_article",
      "get_article_ids_paged",
      "get_num_accounts",
      "get_account",
      "get_accounts_paged",
    ],
    changeMethods: ["post_article", "donate"],
  });

  _near.fetchBlockHash = async () => {
    const block = await nearConnection.connection.provider.block({
      finality: "final",
    });
    return nearAPI.utils.serialize.base_decode(block.header.hash);
  };

  _near.fetchBlockHeight = async () => {
    const block = await nearConnection.connection.provider.block({
      finality: "final",
    });
    return block.header.height;
  };

  _near.fetchNextNonce = async () => {
    const accessKeys = await _near.account.getAccessKeys();
    return accessKeys.reduce(
      (nonce, accessKey) => Math.max(nonce, accessKey.access_key.nonce + 1),
      1
    );
  };

  _near.sendTransactions = async (items, callbackUrl) => {
    let [nonce, blockHash] = await Promise.all([
      _near.fetchNextNonce(),
      _near.fetchBlockHash(),
    ]);

    const transactions = [];
    let actions = [];
    let currentReceiverId = null;
    let currentTotalGas = Big(0);
    items.push([null, null]);
    items.forEach(([receiverId, action]) => {
      const actionGas =
        action && action.functionCall ? Big(action.functionCall.gas) : Big(0);
      const newTotalGas = currentTotalGas.add(actionGas);
      if (
        receiverId !== currentReceiverId ||
        newTotalGas.gt(MaxGasPerTransaction)
      ) {
        if (currentReceiverId !== null) {
          transactions.push(
            nearAPI.transactions.createTransaction(
              _near.accountId,
              randomPublicKey,
              currentReceiverId,
              nonce++,
              actions,
              blockHash
            )
          );
          actions = [];
        }
        currentTotalGas = actionGas;
        currentReceiverId = receiverId;
      } else {
        currentTotalGas = newTotalGas;
      }
      actions.push(action);
    });
    return await _near.walletConnection.requestSignTransactions(
      transactions,
      callbackUrl
    );
  };

  _near.archivalViewCall = async (blockId, contractId, methodName, args) => {
    args = args || {};
    const result = await _near.nearArchivalConnection.provider.query({
      request_type: "call_function",
      account_id: contractId,
      method_name: methodName,
      args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      block_id: blockId,
    });

    return (
      result.result &&
      result.result.length > 0 &&
      JSON.parse(Buffer.from(result.result).toString())
    );
  };

  return _near;
}

const defaultNearPromise = Promise.resolve(_initNear());
export const useNearPromise = singletonHook(defaultNearPromise, () => {
  return defaultNearPromise;
});

const defaultNear = null;
export const useNear = singletonHook(defaultNear, () => {
  const [near, setNear] = useState(defaultNear);
  const _near = useNearPromise();

  useEffect(() => {
    _near.then(setNear);
  }, [_near]);

  return near;
});
