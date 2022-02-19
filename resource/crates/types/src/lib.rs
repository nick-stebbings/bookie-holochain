use std::collections::BTreeMap;

use hdk::prelude::holo_hash::AgentPubKeyB64;
use hdk::prelude::*;

/// ResourceBooking entry definition.
///
/// The resource_booking must include at a minimum the nickname of the agent
/// in order to be able to search for agents by nickname.
#[hdk_entry(id = "resource_booking", visibility = "public")]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResourceBooking {
    pub nickname: String,
    pub fields: BTreeMap<String, String>,
}

/// Used as a return type of all functions.
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AgentResourceBooking {
    pub agent_pub_key: AgentPubKeyB64,
    pub resource_booking: ResourceBooking,
}

/// Input for the `search_resource_bookings` zome function.
/// 
/// The nickname prefix must be of at least 3 characters.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResourceInput {
    pub nickname_prefix: String,
}
