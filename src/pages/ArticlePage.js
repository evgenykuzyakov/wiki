import React from "react";
import { useParams } from "react-router-dom";
import Article from "../components/Article";
import EditArticle from "../components/EditArticle";

export default function ArticlePage(props) {
  let { articleId } = useParams();
  articleId = articleId || "";
  const edit = !!props.edit;
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          {edit ? (
            <EditArticle articleId={articleId} />
          ) : (
            <Article articleId={articleId} />
          )}
        </div>
      </div>
    </div>
  );
}
