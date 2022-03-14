import React from "react";
import { displayTime } from "../../data/utils";
import { Link } from "react-router-dom";
import SocialAccount from "../SocialAccount/SocialAccount";

export default function ArticleMeta(props) {
  const articleId = props.articleId;
  const article = props.article;
  const showEdit = props.showEdit;
  const previewButton = props.previewButton;
  const buttons = (
    <div>
      {previewButton && (
        <button
          className="me-2 mt-2 btn btn-primary "
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#a-${previewButton}`}
          aria-expanded="false"
          aria-controls={`a-${previewButton}`}
        >
          Toggle article preview
        </button>
      )}
      {previewButton && (
        <button
          className="me-2 mt-2 btn btn-primary "
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#d-${previewButton}`}
          aria-expanded="false"
          aria-controls={`d-${previewButton}`}
        >
          Toggle diff
        </button>
      )}
      {showEdit && !previewButton && (
        <Link
          to={`/edit/${articleId}`}
          className={`me-2 mt-2 btn ${
            article ? "btn-outline-secondary" : "btn-primary"
          }`}
        >
          {article ? "Edit this article" : "Create this article"}
        </Link>
      )}
      {showEdit && previewButton && (
        <Link
          to={`/block/${article.blockHeight}/edit/${articleId}`}
          className={`me-2 mt-2 btn btn-outline-secondary`}
        >
          Edit this version
        </Link>
      )}
      {article && !previewButton && (
        <Link
          to={`/history/${articleId}`}
          className="me-2 mt-2 btn btn-outline-secondary"
        >
          View edit history
        </Link>
      )}
      {article && (
        <Link
          to={`/block/${article.blockHeight}/${articleId}`}
          className="me-2 mt-2 btn btn-outline-secondary"
        >
          Permanent URL
        </Link>
      )}
    </div>
  );
  return article ? (
    <div className="mt-5 alert alert-secondary">
      <div>
        Last edit by <SocialAccount accountId={article.author} clickable />
        <br />
        Edited on {displayTime(new Date(article.timestamp))}
        <br />
        Edit versions: {article.editVersion + 1}
      </div>
      {buttons}
    </div>
  ) : (
    buttons
  );
}
