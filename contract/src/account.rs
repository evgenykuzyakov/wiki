use crate::*;
use near_sdk::StorageUsage;

const CURRENT_VERSION: u32 = 0;

#[derive(BorshSerialize, BorshDeserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Account {
    /// When a contract is upgraded, the front-end needs to know which version it retrieves.
    /// The value is not stored on chain, but instead populated by the contract code.
    #[borsh_skip]
    pub version: u32,

    #[serde(with = "unordered_set_expensive")]
    pub articles: UnorderedSet<ArticleId>,

    #[serde(with = "u128_dec_format")]
    pub near_deposit: Balance,

    pub article_bytes: StorageUsage,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum VAccount {
    Current(Account),
}

impl From<VAccount> for Account {
    fn from(v: VAccount) -> Self {
        match v {
            VAccount::Current(mut c) => {
                c.version = CURRENT_VERSION;
                c
            }
        }
    }
}

impl From<Account> for VAccount {
    fn from(c: Account) -> Self {
        VAccount::Current(c)
    }
}

impl Account {
    pub fn new(account_id: AccountId) -> Self {
        Self {
            version: CURRENT_VERSION,
            articles: UnorderedSet::new(StorageKey::AccountArticles { account_id }),
            near_deposit: 0,
            article_bytes: 0,
        }
    }

    pub fn remove_article(&mut self, article_id: &ArticleId, article_size: StorageUsage) {
        self.articles.remove(article_id);
        self.article_bytes -= article_size;
    }

    pub fn add_article(&mut self, article_id: &ArticleId, article_size: StorageUsage) {
        self.articles.insert(article_id);
        self.article_bytes += article_size;
    }
}

impl Contract {
    pub fn internal_get_account_or_default(&self, account_id: &AccountId) -> Account {
        self.internal_get_account(account_id)
            .unwrap_or_else(|| Account::new(account_id.clone()))
    }

    pub fn internal_get_account(&self, account_id: &AccountId) -> Option<Account> {
        self.accounts.get(&account_id).map(|a| a.into())
    }

    pub fn internal_set_account(&mut self, account_id: &AccountId, account: Account) {
        self.accounts.insert(&account_id, &account.into());
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_num_accounts(&self) -> u64 {
        self.accounts.len()
    }

    pub fn get_account(&self, account_id: AccountId) -> Option<Account> {
        self.internal_get_account(&account_id)
    }

    pub fn get_accounts_paged(
        &self,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<(AccountId, Account)> {
        let keys = self.accounts.keys_as_vector();
        let values = self.accounts.values_as_vector();
        let from_index = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(values.len());
        (from_index..std::cmp::min(values.len(), from_index + limit))
            .map(|index| (keys.get(index).unwrap(), values.get(index).unwrap().into()))
            .collect()
    }
}
