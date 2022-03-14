pub mod emit {
    use near_sdk::log;
    use near_sdk::serde_json::json;

    use crate::*;

    pub fn post_article(article_id: &ArticleId, article: &Article) {
        let event = json!({
            "standard": "thewiki",
            "version": "1.0.0",
            "event": "post_article",
            "data": [
                {"article_id": article_id, "edit_version": article.edit_version, "block_height": article.block_height, "author": &article.author}
            ]
        });

        log!("EVENT_JSON:{}", event.to_string());
    }
}
