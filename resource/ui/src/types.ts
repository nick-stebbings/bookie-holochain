import { AgentPubKeyB64, Dictionary } from '@holochain-open-dev/core-types';

export interface BookableResource {
  nickname: string;
  fields: Dictionary<string>;
}

export interface AgentBookableResource {
  agentPubKey: AgentPubKeyB64;
  resourceBooking: BookableResource;
}

export interface SearchResourceInput {
  nicknamePrefix: string;
}