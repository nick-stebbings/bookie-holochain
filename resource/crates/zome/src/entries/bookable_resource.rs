use hdk::prelude::holo_hash::*;
use hdk::prelude::*;

#[hdk_entry(id = "bookable_resource", visibility = "public")]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct BookableResource {
    pub name: String,
    pub created_at: Timestamp,
    pub author: AgentPubKeyB64,
}

impl BookableResource {
    pub fn new(name: String) -> ExternResult<Self> {
        Ok(BookableResource {
            name: name,
            created_at: sys_time()?,
            author: agent_info()?.agent_latest_pubkey.into(),
        })
    }
}
