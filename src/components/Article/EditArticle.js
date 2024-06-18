import React, { useEffect, useState } from "react";
import { useArticle } from "../../data/article";
import ArticleMeta from "./ArticleMeta";
import { useAccount } from "../../data/account";
import { Loading } from "../../data/utils";
import { TGas } from "../../data/near";
import Editor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { Markdown } from "./Markdown";
import { postJson } from "../../data/fetch-json";

const defaultBody = (articleId) => `# ${articleId}

*write the content of the article here*

`;
const defaultNavigationId = (articleId) => `${articleId}_nav`;

export default function EditArticle(props) {
  const mdEditor = React.useRef(null);

  const blockId = props.blockId;
  const articleId = props.articleId;
  const { article, refreshArticle } = useArticle(articleId, blockId);
  const account = useAccount();

  const [loading, setLoading] = useState(true);

  const [navigationId, setNavigationId] = useState(null);
  const [body, setBody] = useState(null);

  useEffect(() => {
    document.title = articleId
      ? `Editing ${articleId} | wiki`
      : "Editing the main page | wiki";
  }, [articleId]);

  useEffect(() => {
    if (body === null && (article || article === false)) {
      setBody(article ? article.body : defaultBody(articleId));
      setNavigationId(article?.navigationId);

      setLoading(false);
    }
  }, [body, article, articleId]);

  const postArticle = async () => {
    setLoading(true);

    // TODO: Pass contractId without using account.near
    const contractId = account.near.contract.contractId;
    await postJson(`/web4/contract/${contractId}/post_article`, {
      article_id: articleId,
      body,
      navigation_id: navigationId !== "" ? navigationId : null,
      web4_gas: TGas.mul(75).toFixed(),
    });

    const newArticle = {
      body,
      navigationId,
      timestamp: new Date().getTime(),
      author: account.accountId,
      editVersion: article ? article.editVersion + 1 : 0,
    };

    await refreshArticle(newArticle);

    setLoading(false);
  };

  return !body ? (
    Loading
  ) : (
    <div>
      {!account.accountId && (
        <div className="alert alert-warning">
          You need to sign in to edit this article
        </div>
      )}
      <div className="mb-3">
        <Editor
          ref={mdEditor}
          value={body}
          style={{
            height: "30em",
          }}
          htmlClass="article"
          onChange={({ text }) => setBody(text)}
          renderHTML={Markdown}
        />
      </div>
      <div className="mb-3 row justify-content-md-center">
        <div className="col-auto">
          <label className="col-form-label" htmlFor="navigationId">
            Article ID for navigation menu (optional):
          </label>
        </div>
        <div className="col">
          <input
            className="form-control"
            type="text"
            id="navigationId"
            placeholder={defaultNavigationId(articleId)}
            value={navigationId || ""}
            onChange={(e) => setNavigationId(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-3">
        <button
          className="btn btn-primary"
          disabled={!account.accountId || loading}
          onClick={postArticle}
        >
          {loading && Loading}
          Save article
        </button>

        <a
          href={`/${articleId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary ms-2"
        >
          View article
        </a>
      </div>
      <ArticleMeta article={article} articleId={articleId} />
    </div>
  );
}
