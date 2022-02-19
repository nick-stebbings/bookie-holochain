//! ## hc_zome_resource_bookings
//! 
//! Resource zome for any Holochain app.
//! 
//! If you need to manage resource (nickname, name, avatar, age and other useful personal information)
//! you can directly include this zome in your DNA.
//! 
//! Read about how to include both this zome and its frontend module in your application [here](https://holochain-open-dev.github.io/resource).

use hdk::prelude::holo_hash::AgentPubKeyB64;
use hdk::prelude::*;

mod handlers;
mod utils;

use hc_zome_resource_bookings_types::*;

entry_defs![PathEntry::entry_def(), ResourceBooking::entry_def()];

/// Creates the resource_booking for the agent executing this call.
#[hdk_extern]
pub fn create_resource_booking(resource_booking: ResourceBooking) -> ExternResult<AgentResourceBooking> {
    handlers::create_resource_booking(resource_booking)
}

/// Updates the resource_booking for the agent executing this call.
#[hdk_extern]
pub fn update_resource_booking(resource_booking: ResourceBooking) -> ExternResult<AgentResourceBooking> {
    handlers::update_resource_booking(resource_booking)
}

/// From a search input of at least 3 characters, returns all the agents whose nickname starts with that prefix.
#[hdk_extern]
pub fn search_resource_bookings(
    search_resource_bookings_input: SearchResourceInput,
) -> ExternResult<Vec<AgentResourceBooking>> {
    let agent_resource_bookings = handlers::search_resource_bookings(search_resource_bookings_input.nickname_prefix)?;

    Ok(agent_resource_bookings)
}

/// Returns the resource_booking for the given agent, if they have created it.
#[hdk_extern]
pub fn get_agent_resource_booking(agent_pub_key: AgentPubKeyB64) -> ExternResult<Option<AgentResourceBooking>> {
    let agent_resource_booking = handlers::get_agent_resource_booking(agent_pub_key)?;

    Ok(agent_resource_booking)
}

/// Returns the resource for the given agents if they have created them.
///
/// Use this function if you need to get the resource_booking for multiple agents at the same time,
/// as it will be more performant than doing multiple `get_agent_resource_booking`.
#[hdk_extern]
pub fn get_agents_resource_booking(
    agent_pub_keys_b64: Vec<AgentPubKeyB64>,
) -> ExternResult<Vec<AgentResourceBooking>> {
    let agent_resource_bookings = handlers::get_agents_resource_booking(agent_pub_keys_b64)?;

    Ok(agent_resource_bookings)
}

/// Gets the resource_booking for the agent calling this function, if they have created it.
#[hdk_extern]
pub fn get_my_resource_booking(_: ()) -> ExternResult<Option<AgentResourceBooking>> {
    let agent_info = agent_info()?;

    let agent_resource_booking =
        handlers::get_agent_resource_booking(AgentPubKeyB64::from(agent_info.agent_initial_pubkey))?;

    Ok(agent_resource_booking)
}

/// Gets all the resource that have been created in the network.
///
/// Careful! This will not be very performant in large networks.
/// In the future a cursor type functionality will be added to make this function performant.
#[hdk_extern]
pub fn get_all_resource_bookings(_: ()) -> ExternResult<Vec<AgentResourceBooking>> {
    let agent_resource_bookings = handlers::get_all_resource_bookings()?;

    Ok(agent_resource_bookings)
}
