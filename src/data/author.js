import useSWR from "swr";
import { keysToCamel } from "./utils";
import { useNear } from "./near";

const authors = {};

export const authorFetcher = async (_key, accountId, near) => {
  if (accountId in authors) {
    return authors[accountId];
  }
  if (!near) {
    return null;
  }
  try {
    const author = keysToCamel(
      await near.contract.get_account({ account_id: accountId })
    );
    return (authors[accountId] = author);
  } catch (e) {
    return (authors[accountId] = false);
  }
};

export const useAuthor = (accountId) => {
  const { data: author } = useSWR(
    ["author_id", accountId, useNear()],
    authorFetcher
  );
  return author;
};
