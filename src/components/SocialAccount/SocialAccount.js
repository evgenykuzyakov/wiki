import React from "react";
import DefaultAvatar from "../../images/sasha_anon.png";
import { useSocialAccount } from "../../data/socialAccount";
import "./SocialAccount.scss";

export default function SocialAccount(props) {
  const accountId = props.accountId;
  const clickable = props.clickable;
  const socialAccount = useSocialAccount(accountId);
  const avatarUrl = socialAccount?.avatar?.url || DefaultAvatar;
  const displayName = socialAccount?.displayName
    ? `${socialAccount.displayName} (${accountId})`
    : accountId;
  const accountUrl = `/author/${accountId}`;
  const inner = (
    <div className="social-account">
      <img src={avatarUrl} title={accountId} alt={accountId} />
      <span title={accountId}>{displayName}</span>
    </div>
  );
  return clickable ? <a href={accountUrl}>{inner}</a> : inner;
}
