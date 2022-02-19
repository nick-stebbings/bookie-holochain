#[hdk_entry(id = "bookable_resource", visibility = "public")]
#[derive(Clone)]
#[serde(rename_all = "camelCase")]
pub struct BookableResource {
    pub name: String,
    pub create_at: Timestamp,
    pub author: AgentPubKeyB64,
}

#[hdk_entry(id = "booking_slot", visibility = "public")]
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BookingSlot {
    pub resource_hash: EntryHashB64,
    pub time_range: TimeRange,
}

#[hdk_entry(id = "booking_request", visibility = "public")]
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BookingRequest {
    pub booking_slot_hashes: Vec<EntryHashB64>,
    pub resource_user: AgentPubKeyB64,
    // TODO: is timestamp required?
}

#[hdk_entry(id = "booking", visibility = "public")]
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Booking {
    pub slots: Vec<BookingSlots>,
    pub resource_user: AgentPubKey,
}

#[hdk_entry(id = "time_range", visibility = "public")]
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TimeRange {
    pub start_time: Timestamp,
    pub end_time: Timestamp,
}
