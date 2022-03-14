import React from "react";
import { useParams } from "react-router-dom";
import Article from "../components/Article/Article";
import EditArticle from "../components/Article/EditArticle";

export default function ArticlePage(props) {
  let { articleId, blockId } = useParams();
  articleId = articleId || "";
  blockId = blockId ? parseInt(blockId) : null;
  const edit = !!props.edit;
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          {edit ? (
            <EditArticle articleId={articleId} blockId={blockId} />
          ) : (
            <Article articleId={articleId} blockId={blockId} />
          )}
        </div>
      </div>
    </div>
  );
}
