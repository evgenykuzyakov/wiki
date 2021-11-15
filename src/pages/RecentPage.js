import React from "react";
import RecentArticles from "../components/RecentArticles";

export default function RecentPage(props) {
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          <RecentArticles />
        </div>
      </div>
    </div>
  );
}
