import { AgentPubKeyB64, Dictionary } from '@holochain-open-dev/core-types';

export interface ResourceBooking {
  nickname: string;
  fields: Dictionary<string>;
}

export interface AgentResourceBooking {
  agentPubKey: AgentPubKeyB64;
  resourceBooking: ResourceBooking;
}

export interface SearchResourceInput {
  nicknamePrefix: string;
}