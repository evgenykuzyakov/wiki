pub mod emit {
    use near_sdk::serde_json::json;
    use near_sdk::{log, Duration};

    use crate::*;

    const MAX_NEAR_SOCIAL_LENGTH: usize = 37;
    const SAME_AUTHOR_UPDATE_INTERVAL: Duration = 24 * 60 * 60 * 1_000_000_000;

    pub fn post_article(
        article_id: &ArticleId,
        article: &Article,
        previous_article: &Option<Article>,
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
                    "previous_author": previous_article.as_ref().map(|a| &a.author),
                }
            ]
        });

        log!("EVENT_JSON:{}", event.to_string());

        let message = if let Some(previous_article) = previous_article.as_ref() {
            let previous_author = &previous_article.author;
            if previous_author == &article.author {
                if previous_article.timestamp + SAME_AUTHOR_UPDATE_INTERVAL < article.timestamp {
                    Some(format!(
                        "Article https://thewiki.near.page/{} was updated by {}",
                        article_id,
                        account_to_mention(&article.author),
                    ))
                } else {
                    None
                }
            } else {
                Some(format!(
                    "Article https://thewiki.near.page/{} previously edited by {} was updated by {}",
                    article_id,
                    account_to_mention(previous_author),
                    account_to_mention(&article.author),
                ))
            }
        } else {
            Some(format!(
                "New article https://thewiki.near.page/{} was created by {}",
                article_id,
                account_to_mention(&article.author),
            ))
        };

        if let Some(message) = message {
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
