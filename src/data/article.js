import { keysToCamel } from "./utils";
import useSWR from "swr";
import { useAccount } from "./account";

const articles = {};

export const articleFetcher = async (_key, articleId, account) => {
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
  return (articles[articleId] = article);
};

export const useArticle = (articleId) => {
  const {
    data: article,
    mutate,
    isValidating,
  } = useSWR(["article_id", articleId, useAccount()], articleFetcher);
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
