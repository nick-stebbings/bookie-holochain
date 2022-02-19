use hdk::prelude::holo_hash::AgentPubKeyB64;
use hdk::prelude::*;

mod anchors;
mod entities;
mod handlers;
mod utils;

use entities::{BookableResource, Booking, BookingRequest, BookingSlot, TimeRange};

entry_defs![
    PathEntry::entry_def(),
    BookableResource::entry_def(),
    Booking::entry_def(),
    BookingSlot::entry_def(),
    BookingRequest::entry_def()
];

/// Creates the bookable_resource for the agent executing this call.
#[hdk_extern]
pub fn create_bookable_resource(
    bookable_resource: BookableResource,
) -> ExternResult<AgentBookableResource> {
    handlers::create_bookable_resource(bookable_resource)
}

#[hdk_extern]
pub fn get_all_resources(_: ()) -> Vec<BTreeMap<EntryHashB64, Resource>> {
    todo!()
}

#[hdk_extern]
pub fn create_bookable_slot(
    resource_hash: EntryHashB64,
    time_range: TimeRange,
) -> ExternResult<BTreeMap<EntryHashB64, BookingSlot>> {
    todo!()
}

#[hdk_extern]
pub fn get_booking_requests(
    slot_hash: EntryHashB64,
) -> Vec<BTreeMap<EntryHashB64, BookingRequest>> {
    todo!()
}

// Booking request management
#[hdk_extern]
pub fn create_booking_request(booking_slot: EntryHashB64) {
    todo!()
}

#[hdk_extern]
pub fn decline_booking_request(booking_request_hash: EntryHashB64) {
    todo!()
}

#[hdk_extern]
pub fn cancel_booking_request(booking_request_hash: EntryHashB64) {
    todo!()
}

#[hdk_extern]
pub fn accept_booking_request(booking_request_hash: EntryHashB64) {
    todo!()
}

#[hdk_extern]
pub fn get_bookings_slots(
    resource_hash: EntryHashB64,
) -> ExternResult<BTreeMap<EntryHashB64, BookingSlot>> {
    todo!()
}
