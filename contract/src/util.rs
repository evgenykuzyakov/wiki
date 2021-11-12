use crate::*;

pub(crate) mod u128_dec_format {
    use near_sdk::serde::Serializer;

    pub fn serialize<S>(num: &u128, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&num.to_string())
    }
}

pub(crate) mod u64_dec_format {
    use near_sdk::serde::Serializer;

    pub fn serialize<S>(num: &u64, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&num.to_string())
    }
}

pub(crate) mod unordered_set_expensive {
    use super::*;
    use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
    use near_sdk::serde::Serializer;

    pub fn serialize<S, T>(set: &UnorderedSet<T>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
        T: Serialize + BorshDeserialize + BorshSerialize,
    {
        serializer.collect_seq(set.iter())
    }
}
