import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { StoreSubscriber } from 'lit-svelte-stores';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { contextProvided } from '@holochain-open-dev/context';
import {
  CircularProgress,
  ListItem,
  List,
} from '@scoped-elements/material-web';

import { sharedStyles } from './utils/shared-styles';
import { ResourceStore } from '../resource-store';
import { resourceStoreContext } from '../context';
import { AgentAvatar } from './agent-avatar';

/**
 * @element list-resource-bookings
 * @fires agent-selected - Fired when the user selects an agent from the list. Detail will have this shape: { agentPubKey: 'uhCAkSEspAJks5Q8863Jg1RJhuJHJpFWzwDJkxVjVSk9JueU' }
 */
export class ListResource extends ScopedElementsMixin(LitElement) {
  /** Dependencies */

  /**
   * `ResourceStore` that is requested via context.
   * Only set this property if you want to override the store requested via context.
   */
  @contextProvided({ context: resourceStoreContext })
  @property({ type: Object })
  store!: ResourceStore;

  /** Private properties */

  @state()
  private _loading = true;

  private _allResource = new StoreSubscriber(
    this,
    () => this.store?.knownResource
  );

  async firstUpdated() {
    await this.store.fetchAllResource();
    this._loading = false;
  }

  initials(nickname: string): string {
    return nickname
      .split(' ')
      .map(name => name[0])
      .join('');
  }

  fireAgentSelected(index: number) {
    const agentPubKey = Object.keys(this._allResource.value)[index];

    if (agentPubKey) {
      this.dispatchEvent(
        new CustomEvent('agent-selected', {
          bubbles: true,
          composed: true,
          detail: {
            agentPubKey,
          },
        })
      );
    }
  }

  render() {
    if (this._loading)
      return html`<div class="fill center-content">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;

    if (Object.keys(this._allResource.value).length === 0)
      return html`<mwc-list-item
        >There are no created resource yet</mwc-list-item
      >`;

    return html`
      <mwc-list
        style="min-width: 80px;"
        @selected=${(e: CustomEvent) => this.fireAgentSelected(e.detail.index)}
      >
        ${Object.entries(this._allResource.value).map(
          ([agent_pub_key, resourceBooking]) => html`
            <mwc-list-item
              graphic="avatar"
              .value=${agent_pub_key}
              style="--mdc-list-item-graphic-size: 32px;"
            >
              <agent-avatar slot="graphic" .agentPubKey=${agent_pub_key}>
              </agent-avatar>
              <span>${resourceBooking.nickname}</span>
            </mwc-list-item>
          `
        )}
      </mwc-list>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
      }
    `,
  ];

  /**
   * @ignore
   */
  static get scopedElements() {
    return {
      'agent-avatar': AgentAvatar,
      'mwc-circular-progress': CircularProgress,
      'mwc-list': List,
      'mwc-list-item': ListItem,
    };
  }
}
