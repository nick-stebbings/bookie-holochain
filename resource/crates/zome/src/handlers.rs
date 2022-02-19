use crate::{utils, AgentResourceBooking, ResourceBooking};
use hdk::prelude::holo_hash::AgentPubKeyB64;
use hdk::prelude::*;
use std::convert::TryInto;

pub fn create_resource_booking(resource_booking: ResourceBooking) -> ExternResult<AgentResourceBooking> {
    let agent_info = agent_info()?;

    create_entry(&resource_booking.clone())?;

    let resource_booking_hash = hash_entry(&resource_booking.clone())?;

    let path = prefix_path(resource_booking.nickname.clone());

    path.ensure()?;

    let agent_address: AnyDhtHash = agent_info.agent_initial_pubkey.clone().into();

    create_link(
        path.path_entry_hash()?,
        resource_booking_hash.clone(),
        link_tag(resource_booking.nickname.as_str().clone())?,
    )?;
    create_link(
        agent_address.into(),
        resource_booking_hash.clone(),
        link_tag("resource_booking")?,
    )?;

    let agent_resource_booking = AgentResourceBooking {
        agent_pub_key: AgentPubKeyB64::from(agent_info.agent_initial_pubkey),
        resource_booking,
    };

    Ok(agent_resource_booking)
}

pub fn update_resource_booking(resource_booking: ResourceBooking) -> ExternResult<AgentResourceBooking> {
    let agent_info = agent_info()?;

    create_entry(&resource_booking.clone())?;

    let resource_booking_hash = hash_entry(&resource_booking.clone())?;

    let path = prefix_path(resource_booking.nickname.clone());

    path.ensure()?;

    let agent_address = agent_info.agent_initial_pubkey.clone();

    let link_details = get_link_details(path.path_entry_hash()?, None)?.into_inner();

    if link_details.len() > 0 {
        // check whether the agent has committed a resource_booking before
        // needs to be checked because duplicate ResourceBooking is possible
        let resource_booking_exist = link_details
            .clone()
            .into_iter()
            .find(|detail| detail.0.header().author().to_owned() == agent_address)
            .is_some();
        if resource_booking_exist {
            link_details
                .clone()
                .into_iter()
                .filter_map(|detail| {
                    let is_my_resource_booking = detail.0.header().author().to_owned() == agent_address;
                    let is_not_deleted = detail.1.is_empty();
                    if is_my_resource_booking && is_not_deleted {
                        return Some(detail.0.as_hash().to_owned());
                    } else {
                        return None;
                    }
                })
                .for_each(|header| {
                    // ignore error
                    match delete_link(header) {
                        Ok(_) => (),
                        // TODO: probably should return error once one of the delete fails
                        Err(_) => (),
                    }
                });
        }
    }

    let links = get_links(agent_address.clone().into(), Some(link_tag("resource_booking")?))?;
    if links.len() > 0 {
        let link = links[0].clone();
        delete_link(link.create_link_hash)?;
    }

    create_link(
        path.path_entry_hash()?,
        resource_booking_hash.clone(),
        link_tag(resource_booking.nickname.as_str().clone())?,
    )?;
    create_link(
        agent_address.into(),
        resource_booking_hash.clone(),
        link_tag("resource_booking")?,
    )?;

    let agent_resource_booking = AgentResourceBooking {
        agent_pub_key: AgentPubKeyB64::from(agent_info.agent_initial_pubkey),
        resource_booking,
    };

    Ok(agent_resource_booking)
}

pub fn search_resource_bookings(nickname_prefix: String) -> ExternResult<Vec<AgentResourceBooking>> {
    if nickname_prefix.len() < 3 {
        return Err(utils::err(
            "Cannot search with a prefix less than 3 characters",
        ));
    }

    let prefix_path = prefix_path(nickname_prefix);

    get_agent_resource_bookings_for_path(prefix_path.path_entry_hash()?)
}

pub fn get_all_resource_bookings() -> ExternResult<Vec<AgentResourceBooking>> {
    let path = Path::from("all_resource_bookings");

    let children = path.children()?;

    let agent_resource_bookings: Vec<AgentResourceBooking> = children
        .into_iter()
        .map(|link| get_agent_resource_bookings_for_path(link.target))
        .collect::<ExternResult<Vec<Vec<AgentResourceBooking>>>>()?
        .into_iter()
        .flatten()
        .collect();

    Ok(agent_resource_bookings)
}

pub fn get_agent_resource_booking(
    wrapped_agent_pub_key: AgentPubKeyB64,
) -> ExternResult<Option<AgentResourceBooking>> {
    let agent_pub_key = AgentPubKey::from(wrapped_agent_pub_key.clone());

    let agent_address: AnyDhtHash = agent_pub_key.into();

    let links = get_links(agent_address.into(), Some(link_tag("resource_booking")?))?;

    if links.len() == 0 {
        return Ok(None);
    }

    let link = links[0].clone();

    let resource_booking: ResourceBooking = utils::try_get_and_convert(link.target)?;

    let agent_resource_booking = AgentResourceBooking {
        agent_pub_key: wrapped_agent_pub_key,
        resource_booking,
    };

    Ok(Some(agent_resource_booking))
}

pub fn get_agents_resource_booking(
    agent_pub_keys_b64: Vec<AgentPubKeyB64>,
) -> ExternResult<Vec<AgentResourceBooking>> {
    let link_tag = Some(link_tag("resource_booking")?);

    let get_links_input: Vec<GetLinksInput> = agent_pub_keys_b64
        .into_iter()
        .map(|agent_pub_key_b64| {
            let agent_pub_key = AgentPubKey::from(agent_pub_key_b64.clone());
            let agent_address: AnyDhtHash = agent_pub_key.into();
            GetLinksInput::new(agent_address.into(), link_tag.clone())
        })
        .collect();

    let get_links_output = HDK
        .with(|h| h.borrow().get_links(get_links_input))?
        .into_iter()
        .flatten()
        .collect::<Vec<Link>>();

    let get_input = get_links_output
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::default()))
        .collect();
    let get_output = HDK.with(|h| h.borrow().get(get_input))?;

    get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .map(get_agent_resource_booking_from_element)
        .collect()
}

/** Private helpers */

fn prefix_path(nickname: String) -> Path {
    // conver to lowercase for path for ease of search
    let lower_nickname = nickname.to_lowercase();
    let (prefix, _) = lower_nickname.as_str().split_at(3);

    Path::from(format!("all_resource_bookings.{}", prefix))
}

fn get_agent_resource_bookings_for_path(path_hash: EntryHash) -> ExternResult<Vec<AgentResourceBooking>> {
    let links = get_links(path_hash, None)?;

    let get_input = links
        .into_iter()
        .map(|link| GetInput::new(link.target.into(), GetOptions::default()))
        .collect();

    let get_output = HDK.with(|h| h.borrow().get(get_input))?;

    get_output
        .into_iter()
        .filter_map(|maybe_option| maybe_option)
        .map(get_agent_resource_booking_from_element)
        .collect()
}

fn get_agent_resource_booking_from_element(element: Element) -> ExternResult<AgentResourceBooking> {
    let author = element.header().author().clone();

    let resource_booking: ResourceBooking = utils::try_from_element(element)?;

    let agent_resource_booking = AgentResourceBooking {
        agent_pub_key: AgentPubKeyB64::from(author),
        resource_booking,
    };

    Ok(agent_resource_booking)
}

#[derive(Serialize, Deserialize, Debug, SerializedBytes)]
struct StringLinkTag(String);
pub fn link_tag(tag: &str) -> ExternResult<LinkTag> {
    let sb: SerializedBytes = StringLinkTag(tag.into()).try_into()?;
    Ok(LinkTag(sb.bytes().clone()))
}
