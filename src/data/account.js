import { singletonHook } from "react-singleton-hook";
import { useEffect, useState } from "react";
import { useNear } from "./near";


const defaultAccount = {
  loading: true,
  accountId: null,
  state: null,
  near: null,
};

const loadAccount = async (near, setAccount) => {
  const accountId = near.accountId;
  const account = {
    loading: false,
    accountId,
    state: null,
    near,
    refresh: async () => await loadAccount(near, setAccount),
  };
  if (accountId) {
    account.state = await near.account.state();
  }

  setAccount(account);
};

export const useAccount = singletonHook(defaultAccount, () => {
  const [account, setAccount] = useState(defaultAccount);
  const _near = useNear();

  useEffect(() => {
    _near.then(async (near) => {
      try {
        await loadAccount(near, setAccount);
      } catch (e) {
        console.error(e);
      }
    });
  }, [_near]);

  return account;
});
