import React from "react";
import { displayTime } from "../data/utils";
import { Link } from "react-router-dom";

export default function ArticleMeta(props) {
  const articleId = props.articleId;
  const article = props.article;
  const showEdit = props.showEdit;
  const editText = showEdit ? (
    <div>
      <Link
        to={`/edit/${articleId}`}
        className={`mt-3 btn ${
          article ? "btn-outline-secondary" : "btn-primary"
        }`}
      >
        {article ? "Edit this article" : "Create this article"}
      </Link>
    </div>
  ) : (
    <></>
  );
  return article ? (
    <div className="mt-5 alert alert-secondary">
      <div>
        Last edit by {article.author}
        <br />
        Edited on {displayTime(new Date(article.timestamp))}
        <br />
        Edit versions: {article.editVersion + 1}
      </div>
      {editText}
    </div>
  ) : (
    editText
  );
}
