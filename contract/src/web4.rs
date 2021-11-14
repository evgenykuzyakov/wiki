use crate::*;
use regex::Regex;
use std::collections::HashMap;

const INDEX_BODY: &str = include_str!("../res/index.html");

#[allow(dead_code)]
#[derive(Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Web4Request {
    #[serde(rename = "accountId")]
    account_id: Option<ValidAccountId>,
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
    body: Option<Vec<u8>>,
    #[serde(rename = "bodyUrl")]
    body_url: Option<String>,
    #[serde(rename = "preloadUrls")]
    preload_urls: Option<Vec<String>>,
}

impl Web4Response {
    pub fn html_response(text: String) -> Self {
        Self {
            content_type: Some(String::from("text/html; charset=UTF-8")),
            body: Some(text.into_bytes()),
            ..Default::default()
        }
    }

    pub fn plain_response(text: String) -> Self {
        Self {
            content_type: Some(String::from("text/plain; charset=UTF-8")),
            body: Some(text.into_bytes()),
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

#[near_bindgen]
impl Contract {
    #[allow(unused_variables)]
    pub fn web4_get(&self, request: Web4Request) -> Web4Response {
        let path = request.path.expect("Path expected");
        if path.starts_with("/static/") || path == "/favicon.png" || path == "/manifest.json" {
            return Web4Response::body_url(
                String::from("ipfs://bafybeigp72pmdzminfutkp6h7zqdin6z24fhehq7umo26etxq3jn3oehyy")
                    + &path,
            );
        }

        if path == "/robots.txt" {
            return Web4Response::plain_response("User-agent: *\nDisallow:".to_string());
        }

        let article_id = path
            .rfind('/')
            .map(|p| path[(p + 1)..].to_string())
            .unwrap_or_default();
        let re = Regex::new(r"[^\p{L}\p{N} _\-!\.,]+").unwrap();

        let escaped_article_id = re.replace_all(&article_id, "");

        let title = if path.starts_with(PREFIX_HISTORY) {
            format!("Edit history of {} | wiki", escaped_article_id)
        } else {
            format!("{} | wiki", escaped_article_id)
        };

        let article = self.internal_get_article(&article_id);

        let description = article
            .map(|article| article.body.chars().into_iter().take(250).collect())
            .unwrap_or_else(|| "the wiki built on NEAR".to_string())
            .replace("\n", " ");

        let description = re.replace_all(&description, "");

        Web4Response::html_response(
            INDEX_BODY
                .replace("The wiki", &title)
                .replace("the wiki built on NEAR", &description),
        )
    }
}
