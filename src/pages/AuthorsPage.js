import React from "react";
import RecentAuthors from "../components/Authors/RecentAuthors";

export default function AuthorsPage(props) {
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          <RecentAuthors />
        </div>
      </div>
    </div>
  );
}
