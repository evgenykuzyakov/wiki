pub mod emit {
    use near_sdk::log;
    use near_sdk::serde_json::json;

    use crate::*;

    const MAX_NEAR_SOCIAL_LENGTH: usize = 37;

    pub fn post_article(
        article_id: &ArticleId,
        article: &Article,
        previous_author: &Option<AccountId>,
    ) {
        let event = json!({
            "standard": "thewiki",
            "version": "1.0.0",
            "event": "post_article",
            "data": [
                {
                    "article_id": article_id,
                    "edit_version": article.edit_version,
                    "block_height": article.block_height,
                    "author": &article.author,
                    "previous_author": previous_author,
                }
            ]
        });

        log!("EVENT_JSON:{}", event.to_string());

        let message = if let Some(previous_author) = previous_author.as_ref() {
            if previous_author == &article.author {
                format!(
                    "Article https://thewiki.near.page/{} was updated by {}",
                    article_id,
                    account_to_mention(&article.author),
                )
            } else {
                format!(
                    "Article https://thewiki.near.page/{} previously edited by {} was updated by {}",
                    article_id,
                    account_to_mention(previous_author),
                    account_to_mention(&article.author),
                )
            }
        } else {
            format!(
                "New article https://thewiki.near.page/{} was created by {}",
                article_id,
                account_to_mention(&article.author),
            )
        };

        let event = json!({
            "standard": "near_social",
            "version": "1.0.0",
            "event": "post_message",
            "data": [
                {
                    "message": message,
                    "tags": vec!["article"],
                }
            ]
        });

        log!("EVENT_JSON:{}", event.to_string());
    }

    fn account_to_mention(account_id: &AccountId) -> String {
        let s = account_id.as_str();
        if s.len() <= MAX_NEAR_SOCIAL_LENGTH && s.ends_with(".near") && !s.contains("-") {
            let sub_account = &s[..s.len() - 5];
            if !sub_account.contains(".") {
                return format!("@{}", sub_account);
            }
        }
        s.to_string()
    }
}
