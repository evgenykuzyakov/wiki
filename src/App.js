import React, { useCallback, useEffect, useState } from "react";
import Cookies from 'js-cookie'
import "error-polyfill";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "./App.scss";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { TGas, useNearPromise } from "./data/near";
import ArticlePage from "./pages/ArticlePage";
import HistoryPage from "./pages/HistoryPage";
import { OneNear } from "./data/utils";
import { useAccount } from "./data/account";
import ArticlesPage from "./pages/ArticlesPage";
import SocialAccount from "./components/SocialAccount/SocialAccount";
import AuthorsPage from "./pages/AuthorsPage";
import AuthorPage from "./pages/AuthorPage";

import { NearConfig } from "./data/near";

export const refreshAllowanceObj = {};

const WEB4_ACCOUNT_ID = "web4_account_id";

function App(props) {
  const signedIn = !!Cookies.get(WEB4_ACCOUNT_ID);
  const signedAccountId = Cookies.get(WEB4_ACCOUNT_ID);
  const [connected, setConnected] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  const _near = useNearPromise();
  const account = useAccount();

  // TODO: Obtain contractId elsewhere
  const contractId = account?.near?.contract.contractId;

  const requestSignIn = useCallback((e) => {
    setRedirectUrl(`/web4/login?web4_contract_id=${NearConfig.contractName}`);
  }, []);

  const logOut = useCallback(() => {
    // TODO: Is anything else needed here like clearing cookies?
    setRedirectUrl('/web4/logout');
  }, []);

  // TODO: Check if this still works (probably just need to be handled by web4)
  const refreshAllowance = useCallback(async () => {
    alert(
      "You're out of access key allowance. Need sign in again to refresh it"
    );
    await logOut();
    await requestSignIn();
  }, [logOut, requestSignIn]);
  refreshAllowanceObj.refreshAllowance = refreshAllowance;

  useEffect(() => {
    _near.then((near) => {
      setConnected(true);
    });
  }, [_near]);

  const passProps = {
    refreshAllowance: () => refreshAllowance(),
    signedAccountId,
    signedIn,
    connected,
  };

  const header = !connected ? (
    <div>
      Connecting...{" "}
      <span
        className="spinner-grow spinner-grow-sm"
        role="status"
        aria-hidden="true"
      />
    </div>
  ) : signedIn ? (
    <div>
      <form action={`/web4/contract/${contractId}/donate`} method="POST" style={{ display: "inline" }}>
        <input type="hidden" name="web4_gas" value={TGas.mul(10).toFixed()} />
        <input type="hidden" name="web4_deposit" value={OneNear.toFixed()} />
        <button className="btn btn-outline-light me-2" type="submit">Donate 1 NEAR for storage</button>
      </form>

      <button className="btn btn-outline-light" onClick={() => logOut()}>
        Sign out <SocialAccount accountId={signedAccountId} />
      </button>
    </div>
  ) : (
    <div>
      <button
        className="btn btn-outline-light"
        onClick={(e) => requestSignIn(e)}
      >
        Sign in with NEAR
      </button>
    </div>
  );

  if (redirectUrl) {
    window.location.href = redirectUrl;
    return <div>Redirecting...</div>;
  }

  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-3">
          <div className="container-fluid">
            <a className="navbar-brand" href="/" title="the wiki">
              <img
                src="/favicon.png"
                alt="the wiki logo"
                height="24"
                className="d-inline-block align-text-top me-2"
              />
              the wiki
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <Link className="nav-link" aria-current="page" to="/">
                    Main
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    aria-current="page"
                    to="/articles/"
                  >
                    Articles
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" aria-current="page" to="/authors/">
                    Authors
                  </Link>
                </li>
              </ul>
              <div className="d-flex">{header}</div>
            </div>
          </div>
        </nav>

        <Switch>
          <Route path={"/articles/"}>
            <ArticlesPage {...passProps} />
          </Route>
          <Route path={"/recent/"}>
            <ArticlesPage {...passProps} />
          </Route>
          <Route path={"/authors/"}>
            <AuthorsPage {...passProps} />
          </Route>
          <Route path={"/author/:accountId"}>
            <AuthorPage {...passProps} />
          </Route>
          <Route path={"/block/:blockId/edit/:articleId?"}>
            <ArticlePage {...passProps} edit />
          </Route>
          <Route path={"/block/:blockId/:articleId?"}>
            <ArticlePage {...passProps} />
          </Route>
          <Route path={"/edit/:articleId?"}>
            <ArticlePage {...passProps} edit />
          </Route>
          <Route exact path={"/history/:articleId?"}>
            <HistoryPage {...passProps} />
          </Route>
          <Route exact path={"/article/:articleId?"}>
            <ArticlePage {...passProps} />
          </Route>
          <Route exact path={"/:articleId?"}>
            <ArticlePage {...passProps} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
