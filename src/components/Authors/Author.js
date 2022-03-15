import React from "react";
import { useAuthor } from "../../data/author";
import SocialAccount from "../SocialAccount/SocialAccount";
import { Link } from "react-router-dom";

export default function Author(props) {
  const accountId = props.accountId;
  const author = useAuthor(accountId);
  return (
    <div>
      <h1>
        <SocialAccount accountId={accountId} />
      </h1>
      <div>
        {author?.articles?.map((articleId, i) => (
          <li key={articleId}>
            #{i} <Link to={`/${articleId}`}>{articleId || "Main page"}</Link>
          </li>
        ))}
      </div>
    </div>
  );
}
