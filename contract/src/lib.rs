mod account;
mod article;
mod event;
mod util;
mod web4;

pub use account::*;
pub use article::*;
use util::*;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Balance, BorshStorageKey, PanicOnDefault};

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
    ipfs_hash: String,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(ipfs_hash: String) -> Self {
        Self {
            accounts: UnorderedMap::new(StorageKey::Accounts),
            articles: LookupMap::new(StorageKey::Articles),
            article_ids: UnorderedSet::new(StorageKey::ArticleIds),
            ipfs_hash,
        }
    }

    #[private]
    #[init(ignore_state)]
    pub fn migrate(ipfs_hash: String) -> Self {
        #[derive(BorshDeserialize)]
        pub struct OldContract {
            accounts: UnorderedMap<AccountId, VAccount>,
            articles: LookupMap<ArticleId, VArticle>,
            article_ids: UnorderedSet<ArticleId>,
        }

        let OldContract {
            accounts,
            articles,
            article_ids,
        } = env::state_read().unwrap();

        Self {
            accounts,
            articles,
            article_ids,
            ipfs_hash,
        }
    }

    #[payable]
    pub fn donate(&mut self) {
        let account_id = env::predecessor_account_id();
        let mut account = self.internal_get_account_or_default(&account_id);
        account.near_deposit += env::attached_deposit();
        self.internal_set_account(&account_id, account);
    }

    #[private]
    pub fn set_ipfs_hash(&mut self, ipfs_hash: String) {
        self.ipfs_hash = ipfs_hash;
    }

    #[allow(non_snake_case)]
    #[private]
    pub fn web4_setStaticUrl(&mut self, url: String) {
        if url.starts_with("ipfs:") {
            self.ipfs_hash = url[5..].to_string();
        }
    }
}
