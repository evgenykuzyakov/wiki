mod account;
mod article;
mod util;

pub use account::*;
pub use article::*;
use util::*;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::ValidAccountId;
use near_sdk::serde::Serialize;
use near_sdk::{env, near_bindgen, AccountId, Balance, BorshStorageKey, PanicOnDefault};

near_sdk::setup_alloc!();

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Accounts,
    AccountArticles { account_id: AccountId },
    Articles,
    ArticleIds,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    accounts: UnorderedMap<AccountId, VAccount>,
    articles: LookupMap<ArticleId, VArticle>,
    article_ids: UnorderedSet<ArticleId>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {
            accounts: UnorderedMap::new(StorageKey::Accounts),
            articles: LookupMap::new(StorageKey::Articles),
            article_ids: UnorderedSet::new(StorageKey::ArticleIds),
        }
    }
}
