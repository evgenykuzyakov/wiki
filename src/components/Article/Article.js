import React, { useEffect, useState } from "react";
import { useArticle } from "../../data/article";
import { Loading } from "../../data/utils";
import ArticleMeta from "./ArticleMeta";
import { Markdown } from "./Markdown";

export default function Article(props) {
  const articleId = props.articleId;
  const blockId = props.blockId;
  const { article } = useArticle(articleId, blockId);
  const { article: articleNavigation } = useArticle(
    article?.navigationId,
    blockId
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = articleId ? `${articleId} | wiki` : "wiki";
  }, [articleId]);

  useEffect(() => {
    if (article || article === false) {
      setLoading(false);
    }
  }, [article]);

  return loading ? (
    Loading
  ) : (
    <div>
      {article ? (
        <div className="row justify-content-md-center">
          {articleNavigation && (
            <div className="article-navigation col-md-3">
              {Markdown(articleNavigation.body)}
            </div>
          )}
          <div className="article col">{Markdown(article.body)}</div>
        </div>
      ) : (
        "Article doesn't exists"
      )}
      <ArticleMeta article={article} articleId={articleId} showEdit />
    </div>
  );
}
