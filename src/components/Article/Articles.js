import React, { useEffect, useState } from "react";
import { Loading } from "../../data/utils";
import { useAccount } from "../../data/account";
import { LsKey } from "../../data/near";
import ls from "local-storage";
import { Link } from "react-router-dom";

const articleIdsLsKey = (offset) => LsKey + "article_ids:" + offset;

const FetchLimit = 250;

const fetchArticleIds = async (offset, account) => {
  const lsKey = articleIdsLsKey(offset);
  const localIds = ls.get(lsKey);
  if (localIds) {
    return localIds;
  }

  const articleIds = await account.near.contract.get_article_ids_paged({
    from_index: offset,
    limit: FetchLimit,
  });

  // Only save to the local storage when the limit is reached to avoid caching issues.
  if (articleIds.length === FetchLimit) {
    ls.set(lsKey, articleIds);
  }

  return articleIds;
};

export default function Articles(props) {
  const account = useAccount();

  const [loading, setLoading] = useState(true);

  const [numArticles, setNumArticles] = useState(null);
  const [articleIds, setArticleIds] = useState([]);

  useEffect(() => {
    document.title = "Articles | wiki";
  }, []);

  useEffect(() => {
    if (account.near && numArticles === null) {
      account.near.contract.get_num_articles().then((numArticles) => {
        setNumArticles(numArticles);
        setLoading(false);
      });
    }
  }, [account, numArticles]);

  useEffect(() => {
    if (account.near && numArticles !== null) {
      const lastOffset =
        articleIds.length > 0 ? articleIds[articleIds.length - 1] : numArticles;
      if (lastOffset > 0) {
        fetchArticleIds(
          Math.trunc((lastOffset - 1) / FetchLimit) * FetchLimit,
          account
        ).then((newIds) => {
          setArticleIds([...articleIds, ...newIds.reverse()]);
        });
      }
    }
  }, [account, numArticles, articleIds]);

  return loading ? (
    Loading
  ) : (
    <div>
      <h1>Recent articles</h1>
      <div>Total {numArticles} articles</div>
      {articleIds.map((articleId, i) => (
        <li key={articleId}>
          #{numArticles - i}{" "}
          <Link to={`/${articleId}`}>{articleId || "Main page"}</Link>
        </li>
      ))}
    </div>
  );
}
