import { CellClient } from '@holochain-open-dev/cell-client';
import { AgentPubKeyB64 } from '@holochain-open-dev/core-types';
import { AgentBookableResource, BookableResource } from './types';

export class ResourceService {
  constructor(public cellClient: CellClient, public zomeName = 'resource') {}

  /**
   * Get my resourceBooking, if it has been created
   * @returns my resourceBooking
   */
  async getMyBookableResource(): Promise<AgentBookableResource> {
    return this.callZome('get_my_bookable_resource', null);
  }

  /**
   * Get the resourceBooking for the given agent, if they have created it
   * 
   * @param agentPubKey the agent to get the resourceBooking for
   * @returns the resourceBooking of the agent
   */
  async getAgentBookableResource(agentPubKey: AgentPubKeyB64): Promise<AgentBookableResource> {
    return this.callZome('get_agent_bookable_resource', agentPubKey);
  }

  /**
   * Get the resource for the given agent
   * 
   * @param agentPubKeys the agents to get the resourceBooking for
   * @returns the resourceBooking of the agents, in the same order as the input parameters
   */
  async getAgentsResource(
    agentPubKeys: AgentPubKeyB64[]
  ): Promise<AgentBookableResource[]> {
    return this.callZome('get_agents_bookable_resource', agentPubKeys);
  }

  /**
   * Search resource that start with nicknamePrefix
   * 
   * @param nicknamePrefix must be of at least 3 characters
   * @returns the resource with the nickname starting with nicknamePrefix
   */
  async searchResource(nicknamePrefix: string): Promise<Array<AgentBookableResource>> {
    return this.callZome('search_bookable_resources', {
      nicknamePrefix: nicknamePrefix,
    });
  }

  /**
   * Get the resource for all the agents in the DHT
   * 
   * @returns the resource for all the agents in the DHT
   */
  async getAllResource(): Promise<Array<AgentBookableResource>> {
    return this.callZome('get_all_bookable_resources', null);
  }

  /**
   * Create my resourceBooking
   * 
   * @param resourceBooking the resourceBooking to create
   * @returns my resourceBooking with my agentPubKey
   */
   async createBookableResource(resourceBooking: BookableResource): Promise<AgentBookableResource> {
    const resourceBookingResult = await this.callZome('create_bookable_resource', resourceBooking);

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
  async updateBookableResource(resourceBooking: BookableResource): Promise<AgentBookableResource> {
    const resourceBookingResult = await this.callZome('update_bookable_resource', resourceBooking);

    return {
      agentPubKey: resourceBookingResult.agentPubKey,
      resourceBooking: resourceBookingResult.resourceBooking,
    };
  }

  private callZome(fn_name: string, payload: any) {
    return this.cellClient.callZome(this.zomeName, fn_name, payload);
  }
}
