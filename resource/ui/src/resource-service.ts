import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKeyB64 } from '@holochain-open-dev/core-types';
import { AgentResourceBooking, ResourceBooking } from './types';

export class ResourceService {
  constructor(public cellClient: CellClient, public zomeName = 'resource') {}

  /**
   * Get my resourceBooking, if it has been created
   * @returns my resourceBooking
   */
  async getMyResourceBooking(): Promise<AgentResourceBooking> {
    return this.callZome('get_my_resource_booking', null);
  }

  /**
   * Get the resourceBooking for the given agent, if they have created it
   * 
   * @param agentPubKey the agent to get the resourceBooking for
   * @returns the resourceBooking of the agent
   */
  async getAgentResourceBooking(agentPubKey: AgentPubKeyB64): Promise<AgentResourceBooking> {
    return this.callZome('get_agent_resource_booking', agentPubKey);
  }

  /**
   * Get the resource for the given agent
   * 
   * @param agentPubKeys the agents to get the resourceBooking for
   * @returns the resourceBooking of the agents, in the same order as the input parameters
   */
  async getAgentsResource(
    agentPubKeys: AgentPubKeyB64[]
  ): Promise<AgentResourceBooking[]> {
    return this.callZome('get_agents_resource_booking', agentPubKeys);
  }

  /**
   * Search resource that start with nicknamePrefix
   * 
   * @param nicknamePrefix must be of at least 3 characters
   * @returns the resource with the nickname starting with nicknamePrefix
   */
  async searchResource(nicknamePrefix: string): Promise<Array<AgentResourceBooking>> {
    return this.callZome('search_resource_bookings', {
      nicknamePrefix: nicknamePrefix,
    });
  }

  /**
   * Get the resource for all the agents in the DHT
   * 
   * @returns the resource for all the agents in the DHT
   */
  async getAllResource(): Promise<Array<AgentResourceBooking>> {
    return this.callZome('get_all_resource_bookings', null);
  }

  /**
   * Create my resourceBooking
   * 
   * @param resourceBooking the resourceBooking to create
   * @returns my resourceBooking with my agentPubKey
   */
   async createResourceBooking(resourceBooking: ResourceBooking): Promise<AgentResourceBooking> {
    const resourceBookingResult = await this.callZome('create_resource_booking', resourceBooking);

    return {
      agentPubKey: resourceBookingResult.agentPubKey,
      resourceBooking: resourceBookingResult.resourceBooking,
    };
  }

  /**
   * Update my resourceBooking
   * 
   * @param resourceBooking the resourceBooking to create
   * @returns my resourceBooking with my agentPubKey
   */
  async updateResourceBooking(resourceBooking: ResourceBooking): Promise<AgentResourceBooking> {
    const resourceBookingResult = await this.callZome('update_resource_booking', resourceBooking);

    return {
      agentPubKey: resourceBookingResult.agentPubKey,
      resourceBooking: resourceBookingResult.resourceBooking,
    };
  }

  private callZome(fn_name: string, payload: any) {
    return this.cellClient.callZome(this.zomeName, fn_name, payload);
  }
}
