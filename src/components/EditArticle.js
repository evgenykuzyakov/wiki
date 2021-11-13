import React, { useEffect, useState } from "react";
import { useArticle } from "../data/article";
import ArticleMeta from "./ArticleMeta";
import { useAccount } from "../data/account";
import { Loading } from "../data/utils";
import { TGas } from "../data/near";
import Editor from "react-markdown-editor-lite";
import ReactMarkdown from "react-markdown";
import "react-markdown-editor-lite/lib/index.css";
import gfm from "remark-gfm";

const defaultBody = (articleId) => `# ${articleId}

*write the content of the article here*

`;

export default function EditArticle(props) {
  const mdEditor = React.useRef(null);

  const blockId = props.blockId;
  const articleId = props.articleId;
  const { article, refreshArticle } = useArticle(articleId, blockId);
  const account = useAccount();

  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState(null);

  useEffect(() => {
    document.title = articleId
      ? `Editing ${articleId} | wiki`
      : "Editing the main page | wiki";
  }, [articleId]);

  useEffect(() => {
    if (body === null && (article || article === false)) {
      setBody(article ? article.body : defaultBody(articleId));

      setLoading(false);
    }
  }, [body, article, articleId]);

  const postArticle = async () => {
    setLoading(true);

    await account.near.contract.post_article(
      {
        article_id: articleId,
        body,
      },
      TGas.mul(75).toFixed()
    );

    const newArticle = {
      body,
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
          onChange={({ text }) => setBody(text)}
          renderHTML={(text) => (
            <ReactMarkdown plugins={[gfm]}>{text}</ReactMarkdown>
          )}
        />
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
      <ArticleMeta article={article} />
    </div>
  );
}
