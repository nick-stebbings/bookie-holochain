use std::collections::BTreeMap;

use hdk::prelude::holo_hash::AgentPubKeyB64;
use hdk::prelude::*;

/// BookableResource entry definition.
///
/// The bookable_resource must include at a minimum the nickname of the agent
/// in order to be able to search for agents by nickname.
#[hdk_entry(id = "bookable_resource", visibility = "public")]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct BookableResource {
    pub nickname: String,
    pub fields: BTreeMap<String, String>,
}

/// Used as a return type of all functions.
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AgentBookableResource {
    pub agent_pub_key: AgentPubKeyB64,
    pub bookable_resource: BookableResource,
}

/// Input for the `search_bookable_resources` zome function.
///
/// The nickname prefix must be of at least 3 characters.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResourceInput {
    pub nickname_prefix: String,
}
