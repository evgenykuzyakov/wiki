import React from "react";
import { useParams } from "react-router-dom";
import Author from "../components/Authors/Author";

export default function AuthorPage(props) {
  const { accountId } = useParams();
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          <Author accountId={accountId} />
        </div>
      </div>
    </div>
  );
}
