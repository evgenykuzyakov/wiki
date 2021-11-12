use crate::*;
use near_sdk::{BlockHeight, StorageUsage, Timestamp};

const CURRENT_VERSION: u32 = 0;

pub type ArticleId = String;
pub type ArticleBody = String;

#[derive(BorshSerialize, BorshDeserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Article {
    /// When a contract is upgraded, the front-end needs to know which version it retrieves.
    /// The value is not stored on chain, but instead populated by the contract code.
    #[borsh_skip]
    pub version: u32,

    /// The number of edits of this article.
    pub edit_version: u32,

    #[serde(with = "u64_dec_format")]
    pub timestamp: Timestamp,

    pub block_height: BlockHeight,

    pub author: AccountId,

    pub body: ArticleBody,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum VArticle {
    Current(Article),
}

impl From<VArticle> for Article {
    fn from(v: VArticle) -> Self {
        match v {
            VArticle::Current(mut c) => {
                c.version = CURRENT_VERSION;
                c
            }
        }
    }
}

impl From<Article> for VArticle {
    fn from(c: Article) -> Self {
        VArticle::Current(c)
    }
}

impl Article {
    pub fn new(edit_version: u32, body: ArticleBody, author: AccountId) -> Self {
        Self {
            version: CURRENT_VERSION,
            edit_version,
            timestamp: env::block_timestamp(),
            block_height: env::block_index(),
            author,
            body,
        }
    }

    pub fn get_article_bytes(&self) -> StorageUsage {
        self.body.len() as _
    }
}

impl Contract {
    pub fn internal_get_article(&self, article_id: &ArticleId) -> Option<Article> {
        self.articles.get(&article_id).map(|a| a.into())
    }

    pub fn internal_set_article(&mut self, article_id: &ArticleId, article: Article) {
        self.articles.insert(&article_id, &article.into());
    }
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn post_article(&mut self, article_id: ArticleId, body: ArticleBody) {
        let account_id = env::predecessor_account_id();
        let mut account = self.internal_get_account_or_default(&account_id);
        account.near_deposit += env::attached_deposit();
        let edit_version = if let Some(previous_article) = self.internal_get_article(&article_id) {
            assert_ne!(
                previous_article.block_height,
                env::block_index(),
                "Can't edit the article twice in one block"
            );
            let article_bytes = previous_article.get_article_bytes();
            if previous_article.author == account_id {
                account.remove_article(&article_id, article_bytes);
            } else {
                let mut previous_author =
                    self.internal_get_account_or_default(&previous_article.author);
                previous_author.remove_article(&article_id, article_bytes);
                self.internal_set_account(&previous_article.author, previous_author);
            }
            previous_article.edit_version + 1
        } else {
            0
        };
        let article = Article::new(edit_version, body, article_id.clone());
        account.add_article(&article_id, article.get_article_bytes());
        self.internal_set_account(&article.author, account);
        self.internal_set_article(&article_id, article);
    }

    pub fn get_article(&self, article_id: ArticleId) -> Option<Article> {
        self.internal_get_article(&article_id)
    }

    /// Returns a list of pairs (token_id, asset) for assets from a given index up to a given limit.
    pub fn get_article_ids_paged(
        &self,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<ArticleId> {
        let keys = self.article_ids.as_vector();
        let from_index = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(keys.len());
        (from_index..std::cmp::min(keys.len(), limit))
            .filter_map(|index| keys.get(index))
            .collect()
    }
}
