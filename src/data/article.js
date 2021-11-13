import { keysToCamel } from "./utils";
import useSWR from "swr";
import { useAccount } from "./account";
import ls from "local-storage";
import { LsKey, NearConfig } from "./near";

const articles = {};

const articleLsKey = (blockId, articleId) =>
  LsKey + "article:" + blockId + ":" + articleId;

export const articleFetcher = async (_key, articleId, blockId, account) => {
  if (blockId) {
    const lsKey = articleLsKey(blockId, articleId);
    const localArticle = ls.get(lsKey);
    if (localArticle) {
      return localArticle;
    }

    for (let attempt = 0; attempt < 5; ++attempt) {
      try {
        let article = keysToCamel(
          await account.near.archivalViewCall(
            blockId - attempt,
            NearConfig.contractName,
            "get_article",
            { article_id: articleId }
          )
        );
        if (article) {
          article.timestamp = parseFloat(article.timestamp) / 1e6;
        } else {
          article = false;
        }
        ls.set(lsKey, article);
        if (article) {
          ls.set(articleLsKey(article.blockHeight, articleId), article);
        }
        return article;
      } catch (e) {
        console.log(e);
      }
    }

    return false;
  }

  if (articleId in articles) {
    return articles[articleId];
  }

  if (!account) {
    return null;
  }

  let article = keysToCamel(
    await account.near.contract.get_article({ article_id: articleId })
  );
  if (article) {
    article.timestamp = parseFloat(article.timestamp) / 1e6;
  } else {
    article = false;
  }

  if (article) {
    ls.set(articleLsKey(article.blockHeight, articleId), article);
  }

  return (articles[articleId] = article);
};

export const useArticle = (articleId, blockId) => {
  const {
    data: article,
    mutate,
    isValidating,
  } = useSWR(["article_id", articleId, blockId, useAccount()], articleFetcher);
  return {
    article,
    mutate,
    isValidating,
    refreshArticle: async (newArticle) => {
      delete articles[articleId];
      if (newArticle) {
        await mutate(newArticle);
      }
    },
  };
};
