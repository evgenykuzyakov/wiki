import useSWR from "swr";
import { keysToCamel } from "./utils";

const socialAccounts = {};

export const socialAccountFetcher = async (_key, accountId) => {
  if (accountId in socialAccounts) {
    return socialAccounts[accountId];
  }
  try {
    const res = await fetch(`https://api.near.social/account/${accountId}`);
    if (res.status === 404) {
      return (socialAccounts[accountId] = false);
    } else {
      return (socialAccounts[accountId] = keysToCamel(await res.json()));
    }
  } catch (e) {
    return (socialAccounts[accountId] = false);
  }
};

export const useSocialAccount = (accountId) => {
  const { data: socialAccount } = useSWR(
    ["social_account_id", accountId],
    socialAccountFetcher
  );
  return socialAccount;
};
