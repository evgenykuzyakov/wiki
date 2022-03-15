import React, { useEffect, useState } from "react";
import { keysToCamel, Loading } from "../../data/utils";
import { LsKey, useNear } from "../../data/near";
import ls from "local-storage";
import SocialAccount from "../SocialAccount/SocialAccount";

const accountIdsLsKey = (offset) => LsKey + "account_ids:" + offset;

const FetchLimit = 100;

const fetchAccounts = async (offset, near) => {
  const lsKey = accountIdsLsKey(offset);
  // const localIds = ls.get(lsKey);
  // if (localIds) {
  //   return localIds;
  // }

  const accounts = keysToCamel(
    await near.contract.get_accounts_paged({
      from_index: offset,
      limit: FetchLimit,
    })
  );

  // Only save to the local storage when the limit is reached to avoid caching issues.
  if (accounts.length === FetchLimit) {
    ls.set(lsKey, accounts);
  }

  return accounts;
};

export default function RecentAuthors(props) {
  const near = useNear();

  const [loading, setLoading] = useState(true);

  const [numAccounts, setNumAccounts] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [sortedAccounts, setSortedAccounts] = useState([]);

  useEffect(() => {
    document.title = "Accounts | wiki";
  }, []);

  useEffect(() => {
    if (near && numAccounts === null) {
      near.contract.get_num_accounts().then((numAccounts) => {
        setNumAccounts(numAccounts);
        setLoading(false);
      });
    }
  }, [near, numAccounts]);

  useEffect(() => {
    if (near && numAccounts !== null) {
      const lastOffset =
        accounts.length > 0 ? accounts[accounts.length - 1] : numAccounts;
      if (lastOffset > 0) {
        fetchAccounts(
          Math.trunc((lastOffset - 1) / FetchLimit) * FetchLimit,
          near
        ).then((newAccounts) => {
          setAccounts([...accounts, ...newAccounts.reverse()]);
        });
      }
    }
  }, [near, numAccounts, accounts]);

  useEffect(() => {
    const sortedAccounts = [...accounts];
    sortedAccounts.sort((a, b) => b[1].articles.length - a[1].articles.length);
    setSortedAccounts(sortedAccounts);
  }, [accounts]);

  return loading ? (
    Loading
  ) : (
    <div>
      <h1>Authors</h1>
      <div>Total {numAccounts} authors</div>
      {sortedAccounts.map(([accountId, account]) => (
        <li key={accountId}>
          <SocialAccount accountId={accountId} clickable />
          {account.articles.length > 0 && (
            <span className="muted">
              {" "}
              {account.articles.length} article
              {account.articles.length > 1 ? "s" : ""}
            </span>
          )}
        </li>
      ))}
    </div>
  );
}
