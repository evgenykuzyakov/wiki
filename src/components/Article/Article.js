import React, { useEffect, useState } from "react";
import { useArticle } from "../../data/article";
import { Loading } from "../../data/utils";
import gfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import ArticleMeta from "./ArticleMeta";

export default function Article(props) {
  const articleId = props.articleId;
  const blockId = props.blockId;
  const { article } = useArticle(articleId, blockId);

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
        <div className="article">
          <ReactMarkdown plugins={[gfm]}>{article.body}</ReactMarkdown>
        </div>
      ) : (
        "Article doesn't exists"
      )}
      <ArticleMeta article={article} articleId={articleId} showEdit />
    </div>
  );
}
