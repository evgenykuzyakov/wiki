import React from "react";
import Authors from "../components/Authors/Authors";

export default function AuthorsPage(props) {
  return (
    <div>
      <div className="container">
        <div className="row mb-3">
          <Authors />
        </div>
      </div>
    </div>
  );
}
