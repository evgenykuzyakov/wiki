import React from "react";
import { useParams } from "react-router-dom";
import ArticleHistory from "../components/Article/ArticleHistory";

export default function HistoryPage(props) {
  let { articleId } = useParams();
  articleId = articleId || "";
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          <ArticleHistory articleId={articleId} />
        </div>
      </div>
    </div>
  );
}
