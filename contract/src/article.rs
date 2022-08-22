use crate::*;
use near_sdk::{BlockHeight, StorageUsage, Timestamp};

const VERSION_0: u32 = 0;
// Added navigation_id.
const CURRENT_VERSION: u32 = 1;

pub type ArticleId = String;
pub type ArticleBody = String;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct ArticleV0 {
    /// When a contract is upgraded, the front-end needs to know which version it retrieves.
    /// The value is not stored on chain, but instead populated by the contract code.
    #[borsh_skip]
    pub version: u32,

    /// The number of edits of this article.
    pub edit_version: u32,

    pub timestamp: Timestamp,

    pub block_height: BlockHeight,

    pub author: AccountId,

    pub body: ArticleBody,
}

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

    pub navigation_id: Option<ArticleId>,
}

impl From<ArticleV0> for Article {
    fn from(a: ArticleV0) -> Self {
        let ArticleV0 {
            version,
            edit_version,
            timestamp,
            block_height,
            author,
            body,
        } = a;
        Self {
            version,
            edit_version,
            timestamp,
            block_height,
            author,
            body,
            navigation_id: None,
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum VArticle {
    V0(ArticleV0),
    Current(Article),
}

impl From<VArticle> for Article {
    fn from(v: VArticle) -> Self {
        match v {
            VArticle::V0(mut a) => {
                a.version = VERSION_0;
                a.into()
            }
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
    pub fn new(
        edit_version: u32,
        body: ArticleBody,
        author: AccountId,
        navigation_id: Option<ArticleId>,
    ) -> Self {
        Self {
            version: CURRENT_VERSION,
            edit_version,
            timestamp: env::block_timestamp(),
            block_height: env::block_height(),
            author,
            body,
            navigation_id,
        }
    }

    pub fn get_article_bytes(&self) -> StorageUsage {
        self.body.len() as StorageUsage
            + self.navigation_id.as_ref().map(|a| a.len()).unwrap_or(0) as StorageUsage
    }
}

impl Contract {
    pub fn internal_get_article(&self, article_id: &ArticleId) -> Option<Article> {
        self.articles.get(article_id).map(|a| a.into())
    }

    pub fn internal_set_article(&mut self, article_id: &ArticleId, article: Article) {
        if self.articles.insert(article_id, &article.into()).is_none() {
            self.article_ids.insert(article_id);
        }
    }
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn post_article(
        &mut self,
        article_id: ArticleId,
        body: ArticleBody,
        navigation_id: Option<ArticleId>,
    ) {
        let account_id = env::predecessor_account_id();
        let mut account = self.internal_get_account_or_default(&account_id);
        account.near_deposit += env::attached_deposit();
        let previous_article = self.internal_get_article(&article_id);
        let edit_version = if let Some(previous_article) = previous_article.as_ref() {
            assert_ne!(
                previous_article.block_height,
                env::block_height(),
                "Can't edit the article twice in one block"
            );
            let article_bytes = previous_article.get_article_bytes();
            if &previous_article.author == &account_id {
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
        let article = Article::new(edit_version, body, account_id, navigation_id);
        account.add_article(&article_id, article.get_article_bytes());
        self.internal_set_account(&article.author, account);
        event::emit::post_article(&article_id, &article, &previous_article);
        self.internal_set_article(&article_id, article);
    }

    pub fn get_num_articles(&self) -> u64 {
        self.article_ids.len()
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
        (from_index..std::cmp::min(keys.len(), from_index + limit))
            .filter_map(|index| keys.get(index))
            .collect()
    }
}
