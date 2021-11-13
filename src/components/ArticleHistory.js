import React, { useEffect, useState } from "react";
import { articleFetcher, useArticle } from "../data/article";
import { Loading } from "../data/utils";
import gfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import ArticleMeta from "./ArticleMeta";
import { useAccount } from "../data/account";

export default function ArticleHistory(props) {
  const articleId = props.articleId;
  const { article } = useArticle(articleId);
  const account = useAccount();

  const [loading, setLoading] = useState(true);

  const [articleHistory, setArticleHistory] = useState([]);

  useEffect(() => {
    document.title = articleId
      ? `History of ${articleId} | wiki`
      : "History of the main page | wiki";
  }, [articleId]);

  useEffect(() => {
    if (article || article === false) {
      if (article) {
        setArticleHistory([article]);
      }
      setLoading(false);
    }
  }, [article]);

  useEffect(() => {
    if (articleHistory.length > 0) {
      const oldestArticle = articleHistory[articleHistory.length - 1];
      if (oldestArticle.editVersion > 0) {
        articleFetcher(
          null,
          articleId,
          oldestArticle.blockHeight - 1,
          account
        ).then((article) => {
          if (article) {
            setArticleHistory([...articleHistory, article]);
          }
        });
      }
    }
  }, [articleHistory, account, articleId]);

  return loading ? (
    Loading
  ) : (
    <div>
      <h1>Edit History</h1>
      {articleHistory.map((article) => {
        const key = `a-${article.blockHeight}-${articleId}`;
        return (
          <div key={key}>
            <ArticleMeta
              article={article}
              articleId={articleId}
              showEdit
              previewButton={key}
            />

            <div className="collapse" id={key}>
              <div className="article">
                <ReactMarkdown plugins={[gfm]}>{article.body}</ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
