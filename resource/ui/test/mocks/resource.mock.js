import { hashToString } from 'holochain-ui-test-utils';

export class ResourceMock {
  constructor() {
    this.agents = [];
  }

  create_resource_booking({ username }, provenance) {
    const agent = {
      agent_pub_key: hashToString(provenance),
      resource-booking: { username, fields: {} },
    };
    this.agents.push(agent);

    return agent;
  }

  search_resource_bookings({ username_prefix }) {
    return this.agents
      .filter(a => a.resource-booking.username.startsWith(username_prefix.slice(0, 3)))
      .map(a => ({
        agent_pub_key: a.agent_pub_key,
        ...a,
      }));
  }

  get_my_resource_booking(_, provenance) {
    const agent = this.findAgent(hashToString(provenance));

    if (!agent)
      return {
        agent_pub_key: hashToString(provenance),
      };
    return {
      agent_pub_key: agent.agent_pub_key,
      resource-booking: agent ? agent.resource-booking : undefined,
    };
  }

  get_agent_resource_booking({ agent_address }) {
    const agent = this.findAgent(agent_address);
    return agent ? agent.username : undefined;
  }

  findAgent(agent_address) {
    return this.agents.find(user => user.agent_pub_key === agent_address);
  }
}
