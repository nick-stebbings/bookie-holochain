import { Context, createContext } from '@holochain-open-dev/context';
import { ResourceStore } from './resource-store';

export const resourceStoreContext: Context<ResourceStore> = createContext(
  'hc_zome_resource_bookings/store'
);
