use crate::{utils, AgentBookableResource, BookableResource};
use hdk::prelude::holo_hash::AgentPubKeyB64;
use hdk::prelude::*;
use std::convert::TryInto;

pub fn create_bookable_resource(
    bookable_resource: BookableResource,
) -> ExternResult<AgentBookableResource> {
    let agent_info = agent_info()?;

    create_entry(&bookable_resource.clone())?;

    let bookable_resource_hash = hash_entry(&bookable_resource.clone())?;

    let path = prefix_path(bookable_resource.nickname.clone());

    path.ensure()?;

    let agent_address: AnyDhtHash = agent_info.agent_initial_pubkey.clone().into();

    create_link(
        path.path_entry_hash()?,
        bookable_resource_hash.clone(),
        link_tag(bookable_resource.nickname.as_str().clone())?,
    )?;
    create_link(
        agent_address.into(),
        bookable_resource_hash.clone(),
        link_tag("bookable_resource")?,
    )?;

    let agent_bookable_resource = AgentBookableResource {
        agent_pub_key: AgentPubKeyB64::from(agent_info.agent_initial_pubkey),
        bookable_resource,
    };

    Ok(agent_bookable_resource)
}

// pub fn update_bookable_resource(bookable_resource: BookableResource) -> ExternResult<AgentBookableResource> {
//     let agent_info = agent_info()?;

//     create_entry(&bookable_resource.clone())?;

//     let bookable_resource_hash = hash_entry(&bookable_resource.clone())?;

//     let path = prefix_path(bookable_resource.nickname.clone());

//     path.ensure()?;

//     let agent_address = agent_info.agent_initial_pubkey.clone();

//     let link_details = get_link_details(path.path_entry_hash()?, None)?.into_inner();

//     if link_details.len() > 0 {
//         // check whether the agent has committed a bookable_resource before
//         // needs to be checked because duplicate BookableResource is possible
//         let bookable_resource_exist = link_details
//             .clone()
//             .into_iter()
//             .find(|detail| detail.0.header().author().to_owned() == agent_address)
//             .is_some();
//         if bookable_resource_exist {
//             link_details
//                 .clone()
//                 .into_iter()
//                 .filter_map(|detail| {
//                     let is_my_bookable_resource = detail.0.header().author().to_owned() == agent_address;
//                     let is_not_deleted = detail.1.is_empty();
//                     if is_my_bookable_resource && is_not_deleted {
//                         return Some(detail.0.as_hash().to_owned());
//                     } else {
//                         return None;
//                     }
//                 })
//                 .for_each(|header| {
//                     // ignore error
//                     match delete_link(header) {
//                         Ok(_) => (),
//                         // TODO: probably should return error once one of the delete fails
//                         Err(_) => (),
//                     }
//                 });
//         }
//     }

//     let links = get_links(agent_address.clone().into(), Some(link_tag("bookable_resource")?))?;
//     if links.len() > 0 {
//         let link = links[0].clone();
//         delete_link(link.create_link_hash)?;
//     }

//     create_link(
//         path.path_entry_hash()?,
//         bookable_resource_hash.clone(),
//         link_tag(bookable_resource.nickname.as_str().clone())?,
//     )?;
//     create_link(
//         agent_address.into(),
//         bookable_resource_hash.clone(),
//         link_tag("bookable_resource")?,
//     )?;

//     let agent_bookable_resource = AgentBookableResource {
//         agent_pub_key: AgentPubKeyB64::from(agent_info.agent_initial_pubkey),
//         bookable_resource,
//     };

//     Ok(agent_bookable_resource)
// }

// pub fn search_bookable_resources(nickname_prefix: String) -> ExternResult<Vec<AgentBookableResource>> {
//     if nickname_prefix.len() < 3 {
//         return Err(utils::err(
//             "Cannot search with a prefix less than 3 characters",
//         ));
//     }

//     let prefix_path = prefix_path(nickname_prefix);

//     get_agent_bookable_resources_for_path(prefix_path.path_entry_hash()?)
// }

// pub fn get_all_bookable_resources() -> ExternResult<Vec<AgentBookableResource>> {
//     let path = Path::from("all_bookable_resources");

//     let children = path.children()?;

//     let agent_bookable_resources: Vec<AgentBookableResource> = children
//         .into_iter()
//         .map(|link| get_agent_bookable_resources_for_path(link.target))
//         .collect::<ExternResult<Vec<Vec<AgentBookableResource>>>>()?
//         .into_iter()
//         .flatten()
//         .collect();

//     Ok(agent_bookable_resources)
// }

// pub fn get_agent_bookable_resource(
//     wrapped_agent_pub_key: AgentPubKeyB64,
// ) -> ExternResult<Option<AgentBookableResource>> {
//     let agent_pub_key = AgentPubKey::from(wrapped_agent_pub_key.clone());

//     let agent_address: AnyDhtHash = agent_pub_key.into();

//     let links = get_links(agent_address.into(), Some(link_tag("bookable_resource")?))?;

//     if links.len() == 0 {
//         return Ok(None);
//     }

//     let link = links[0].clone();

//     let bookable_resource: BookableResource = utils::try_get_and_convert(link.target)?;

//     let agent_bookable_resource = AgentBookableResource {
//         agent_pub_key: wrapped_agent_pub_key,
//         bookable_resource,
//     };

//     Ok(Some(agent_bookable_resource))
// }

// pub fn get_agents_bookable_resource(
//     agent_pub_keys_b64: Vec<AgentPubKeyB64>,
// ) -> ExternResult<Vec<AgentBookableResource>> {
//     let link_tag = Some(link_tag("bookable_resource")?);

//     let get_links_input: Vec<GetLinksInput> = agent_pub_keys_b64
//         .into_iter()
//         .map(|agent_pub_key_b64| {
//             let agent_pub_key = AgentPubKey::from(agent_pub_key_b64.clone());
//             let agent_address: AnyDhtHash = agent_pub_key.into();
//             GetLinksInput::new(agent_address.into(), link_tag.clone())
//         })
//         .collect();

//     let get_links_output = HDK
//         .with(|h| h.borrow().get_links(get_links_input))?
//         .into_iter()
//         .flatten()
//         .collect::<Vec<Link>>();

//     let get_input = get_links_output
//         .into_iter()
//         .map(|link| GetInput::new(link.target.into(), GetOptions::default()))
//         .collect();
//     let get_output = HDK.with(|h| h.borrow().get(get_input))?;

//     get_output
//         .into_iter()
//         .filter_map(|maybe_option| maybe_option)
//         .map(get_agent_bookable_resource_from_element)
//         .collect()
// }

// /** Private helpers */
// fn prefix_path(nickname: String) -> Path {
//     // conver to lowercase for path for ease of search
//     let lower_nickname = nickname.to_lowercase();
//     let (prefix, _) = lower_nickname.as_str().split_at(3);

//     Path::from(format!("all_bookable_resources.{}", prefix))
// }

// fn get_agent_bookable_resources_for_path(path_hash: EntryHash) -> ExternResult<Vec<AgentBookableResource>> {
//     let links = get_links(path_hash, None)?;

//     let get_input = links
//         .into_iter()
//         .map(|link| GetInput::new(link.target.into(), GetOptions::default()))
//         .collect();

//     let get_output = HDK.with(|h| h.borrow().get(get_input))?;

//     get_output
//         .into_iter()
//         .filter_map(|maybe_option| maybe_option)
//         .map(get_agent_bookable_resource_from_element)
//         .collect()
// }

// fn get_agent_bookable_resource_from_element(element: Element) -> ExternResult<AgentBookableResource> {
//     let author = element.header().author().clone();

//     let bookable_resource: BookableResource = utils::try_from_element(element)?;

//     let agent_bookable_resource = AgentBookableResource {
//         agent_pub_key: AgentPubKeyB64::from(author),
//         bookable_resource,
//     };

//     Ok(agent_bookable_resource)
// }

// #[derive(Serialize, Deserialize, Debug, SerializedBytes)]
// struct StringLinkTag(String);
// pub fn link_tag(tag: &str) -> ExternResult<LinkTag> {
//     let sb: SerializedBytes = StringLinkTag(tag.into()).try_into()?;
//     Ok(LinkTag(sb.bytes().clone()))
// }
