import { CellClient } from '@holochain-open-dev/cell-client';
import {
  AgentPubKeyB64,
  Dictionary,
  serializeHash,
} from '@holochain-open-dev/core-types';
import merge from 'lodash-es/merge';

import { ResourceService } from './resource-service';
import { AgentResourceBooking, ResourceBooking } from './types';
import { writable, Writable, derived, Readable, get } from 'svelte/store';
import { defaultConfig, ResourceConfig } from './config';

export class ResourceStore {
  /** Private */
  private _service: ResourceService;
  private _knownResourceStore: Writable<Dictionary<ResourceBooking>> = writable({});

  /** Static info */
  public myAgentPubKey: AgentPubKeyB64;

  /** Readable stores */

  // Store containing all the resource that have been fetched
  // The key is the agentPubKey of the agent
  public knownResource: Readable<Dictionary<ResourceBooking>> = derived(
    this._knownResourceStore,
    i => i
  );

  // Store containing my resourceBooking
  public myResourceBooking: Readable<ResourceBooking> = derived(
    this._knownResourceStore,
    resource => resource[this.myAgentPubKey]
  );

  // Returns a store with the resourceBooking of the given agent
  resourceBookingOf(agentPubKey: AgentPubKeyB64): Readable<ResourceBooking> {
    return derived(this._knownResourceStore, resource => resource[agentPubKey]);
  }

  config: ResourceConfig;

  constructor(
    protected cellClient: CellClient,
    config: Partial<ResourceConfig> = {}
  ) {
    this.config = merge(defaultConfig, config);
    this._service = new ResourceService(cellClient, this.config.zomeName);
    this.myAgentPubKey = serializeHash(cellClient.cellId[1]);
  }

  /** Actions */

  /**
   * Fetches the resource for all agents in the DHT
   *
   * You can subscribe to `knowResource` to get updated with all the resource when this call is done
   *
   * Warning! Can be very slow
   */
  async fetchAllResource(): Promise<void> {
    const allResource = await this._service.getAllResource();

    this._knownResourceStore.update(resource => {
      for (const resourceBooking of allResource) {
        resource[resourceBooking.agentPubKey] = resourceBooking.resourceBooking;
      }
      return resource;
    });
  }

  /**
   * Fetches the resourceBooking for the given agent
   */
  async fetchAgentResourceBooking(
    agentPubKey: AgentPubKeyB64
  ): Promise<ResourceBooking | undefined> {
    // For now, optimistic return of the cached resourceBooking
    // TODO: implement cache invalidation

    const knownResource = get(this._knownResourceStore);

    if (knownResource[agentPubKey]) return knownResource[agentPubKey];

    const resourceBooking = await this._service.getAgentResourceBooking(agentPubKey);

    if (!resourceBooking) return;

    this._knownResourceStore.update(resource => {
      resource[resourceBooking.agentPubKey] = resourceBooking.resourceBooking;
      return resource;
    });
    return resourceBooking.resourceBooking;
  }

  /**
   * Fetches the resource for the given agents in the DHT
   *
   * You can subscribe to knowResource to get updated with all the resource when this call is done
   *
   * Use this over `fetchAgentResourceBooking` when fetching multiple resource, as it will be more performant
   */
  async fetchAgentsResource(agentPubKeys: AgentPubKeyB64[]): Promise<void> {
    // For now, optimistic return of the cached resourceBooking
    // TODO: implement cache invalidation

    const knownResource = get(this._knownResourceStore);

    const agentsWeAlreadKnow = Object.keys(knownResource);
    const resourceToFetch = agentPubKeys.filter(
      pubKey => !agentsWeAlreadKnow.includes(pubKey)
    );

    if (resourceToFetch.length === 0) {
      return;
    }

    const fetchedResource = await this._service.getAgentsResource(
      resourceToFetch
    );

    this._knownResourceStore.update(resource => {
      for (const fetchedResourceBooking of fetchedResource) {
        resource[fetchedResourceBooking.agentPubKey] = fetchedResourceBooking.resourceBooking;
      }
      return resource;
    });
  }

  /**
   * Fetch my resourceBooking
   *
   * You can subscribe to `myResourceBooking` to get updated with my resourceBooking
   */
  async fetchMyResourceBooking(): Promise<void> {
    const resourceBooking = await this._service.getMyResourceBooking();
    if (resourceBooking) {
      this._knownResourceStore.update(resource => {
        resource[resourceBooking.agentPubKey] = resourceBooking.resourceBooking;
        return resource;
      });
    }
  }

  /**
   * Search the resource for the agent with nicknames starting with the given nicknamePrefix
   *
   * @param nicknamePrefix must be of at least 3 characters
   * @returns the resource with the nickname starting with nicknamePrefix
   */
  async searchResource(nicknamePrefix: string): Promise<AgentResourceBooking[]> {
    const searchedResource = await this._service.searchResource(nicknamePrefix);

    this._knownResourceStore.update(resource => {
      for (const resourceBooking of searchedResource) {
        resource[resourceBooking.agentPubKey] = resourceBooking.resourceBooking;
      }
      return resource;
    });
    return searchedResource;
  }

  /**
   * Create my resourceBooking
   *
   * Note that there is no guarantee on nickname uniqness
   *
   * @param resourceBooking resourceBooking to be created
   */
  async createResourceBooking(resourceBooking: ResourceBooking): Promise<void> {
    await this._service.createResourceBooking(resourceBooking);

    this._knownResourceStore.update(resource => {
      resource[this.myAgentPubKey] = resourceBooking;
      return resource;
    });
  }

  /**
   * Update my resourceBooking
   *
   * @param resourceBooking resourceBooking to be created
   */
  async updateResourceBooking(resourceBooking: ResourceBooking): Promise<void> {
    await this._service.updateResourceBooking(resourceBooking);

    this._knownResourceStore.update(resource => {
      resource[this.myAgentPubKey] = resourceBooking;
      return resource;
    });
  }
}
