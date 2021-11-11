use near_contract_standards::fungible_token::core_impl::ext_fungible_token;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::json_types::{ValidAccountId, WrappedBalance, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, Balance, BorshStorageKey, Gas, PanicOnDefault,
    Promise,
};

near_sdk::setup_alloc!();

const TGAS: Gas = 1_000_000_000_000;

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Accounts,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(
    ) -> Self {
        Self {}
    }

}
