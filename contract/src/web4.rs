use crate::*;
use near_sdk::json_types::Base64VecU8;
use std::collections::HashMap;
use std::str::FromStr;

const INDEX_BODY: &str = include_str!("../res/index.html");
const DEFAULT_TITLE: &str = "The wiki";
const DEFAULT_DESCRIPTION: &str = "the wiki built on NEAR";

#[allow(dead_code)]
#[derive(Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Web4Request {
    #[serde(rename = "accountId")]
    account_id: Option<AccountId>,
    path: Option<String>,
    params: Option<HashMap<String, String>>,
    query: Option<HashMap<String, Vec<String>>>,
    preloads: Option<HashMap<String, Web4Response>>,
}

#[derive(Serialize, Deserialize, Default)]
#[serde(crate = "near_sdk::serde")]
pub struct Web4Response {
    #[serde(rename = "contentType")]
    content_type: Option<String>,
    status: Option<u32>,
    body: Option<Base64VecU8>,
    #[serde(rename = "bodyUrl")]
    body_url: Option<String>,
    #[serde(rename = "preloadUrls")]
    preload_urls: Option<Vec<String>>,
}

impl Web4Response {
    pub fn html_response(text: String) -> Self {
        Self {
            content_type: Some(String::from("text/html; charset=UTF-8")),
            body: Some(text.into_bytes().into()),
            ..Default::default()
        }
    }

    pub fn plain_response(text: String) -> Self {
        Self {
            content_type: Some(String::from("text/plain; charset=UTF-8")),
            body: Some(text.into_bytes().into()),
            ..Default::default()
        }
    }

    pub fn preload_urls(urls: Vec<String>) -> Self {
        Self {
            preload_urls: Some(urls),
            ..Default::default()
        }
    }

    pub fn body_url(url: String) -> Self {
        Self {
            body_url: Some(url),
            ..Default::default()
        }
    }

    pub fn status(status: u32) -> Self {
        Self {
            status: Some(status),
            ..Default::default()
        }
    }
}

const PREFIX_HISTORY: &str = "/history/";

fn filter_string(s: String) -> String {
    s.chars()
        .into_iter()
        .take(250)
        .filter_map(|c| match c {
            '\n' => Some(' '),
            ' ' | '_' | '.' | '-' | ',' | '!' | '(' | ')' => Some(c),
            _ if c.is_alphanumeric() => Some(c),
            _ => None,
        })
        .collect()
}

#[near_bindgen]
impl Contract {
    #[allow(unused_variables)]
    pub fn web4_get(&self, request: Web4Request) -> Web4Response {
        let path = request.path.expect("Path expected");
        if path.starts_with("/static/") || path == "/favicon.png" || path == "/manifest.json" {
            return Web4Response::body_url(
                String::from("ipfs://") + self.ipfs_hash.as_str() + &path,
            );
        }

        if path == "/articles/" || path == "/recent/" {
            return Web4Response::html_response(
                INDEX_BODY
                    .replace(DEFAULT_TITLE, "Articles | wiki")
                    .replace(
                        DEFAULT_DESCRIPTION,
                        "The list of all articles on the wiki built on NEAR",
                    ),
            );
        }
        if path == "/authors/" {
            return Web4Response::html_response(
                INDEX_BODY.replace(DEFAULT_TITLE, "Authors | wiki").replace(
                    DEFAULT_DESCRIPTION,
                    "The list of all authors contributed to the wiki built on NEAR",
                ),
            );
        }

        if path == "/robots.txt" {
            return Web4Response::plain_response("User-agent: *\nDisallow:".to_string());
        }

        if path.starts_with("/author/") {
            let account_id = AccountId::from_str(&path[8..]).expect("Non valid account ID");
            let title = format!("Author {} | wiki", account_id);
            let description = format!("Articles written by {}", account_id);

            return Web4Response::html_response(
                INDEX_BODY
                    .replace(DEFAULT_TITLE, &title)
                    .replace(DEFAULT_DESCRIPTION, &description),
            );
        }

        let article_id = path
            .rfind('/')
            .map(|p| path[(p + 1)..].to_string())
            .unwrap_or_default();

        let escaped_article_id = filter_string(article_id.clone());

        let title = if path.starts_with(PREFIX_HISTORY) {
            format!("Edit history of {} | wiki", escaped_article_id)
        } else {
            format!("{} | wiki", escaped_article_id)
        };

        let article = self.internal_get_article(&article_id);

        let description = article
            .map(|article| filter_string(article.body))
            .unwrap_or_else(|| DEFAULT_DESCRIPTION.to_string());

        Web4Response::html_response(
            INDEX_BODY
                .replace(DEFAULT_TITLE, &title)
                .replace(DEFAULT_DESCRIPTION, &description),
        )
    }
}
