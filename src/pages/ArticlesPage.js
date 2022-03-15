import React from "react";
import Articles from "../components/Article/Articles";

export default function ArticlesPage(props) {
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          <Articles />
        </div>
      </div>
    </div>
  );
}
