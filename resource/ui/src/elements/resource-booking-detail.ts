import { contextProvided } from '@holochain-open-dev/context';
import { AgentPubKeyB64, Dictionary } from '@holochain-open-dev/core-types';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { html, LitElement } from 'lit';
import { StoreSubscriber } from 'lit-svelte-stores';
import { property, state } from 'lit/decorators.js';
import { SlSkeleton } from '@scoped-elements/shoelace';

import { resourceStoreContext } from '../context';
import { ResourceStore } from '../resource-store';
import { sharedStyles } from './utils/shared-styles';
import { AgentAvatar } from './agent-avatar';

/**
 * @element resource-booking-detail
 */
export class ResourceBookingDetail extends ScopedElementsMixin(LitElement) {
  /** Public properties */

  /**
   * REQUIRED. Public key identifying the agent for which the resourceBooking should be shown
   */
  @property({ type: String, attribute: 'agent-pub-key' })
  agentPubKey!: AgentPubKeyB64;

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

  private _agentResourceBooking = new StoreSubscriber(this, () =>
    this.store?.resourceBookingOf(this.agentPubKey)
  );

  async firstUpdated() {
    await this.store.fetchAgentResourceBooking(this.agentPubKey);
    this._loading = false;
  }

  getAdditionalFields(): Dictionary<string> {
    const fields: Dictionary<string> = {};

    for (const [key, value] of Object.entries(
      this._agentResourceBooking.value.fields
    )) {
      if (key !== 'avatar') {
        fields[key] = value;
      }
    }

    return fields;
  }

  renderAdditionalField(fieldId: string, fieldValue: string) {
    return html`
      <div class="row" style="margin-top: 16px">
        <span style="margin-right: 16px; "> <strong>${fieldId}</strong></span>
        <span>${fieldValue}</span>
      </div>
    `;
  }

  render() {
    if (this._loading)
      return html`
        <div class="column">
          <div class="row" style="align-items: center">
            <sl-skeleton
              effect="pulse"
              style="height: 32px; width: 32px; border-radius: 50%;"
            ></sl-skeleton>
            <div>
              <sl-skeleton
                effect="pulse"
                style="width: 122px; margin-left: 8px;"
              ></sl-skeleton>
            </div>
          </div>

          ${this.store.config.additionalFields.map(
            () => html`
              <sl-skeleton
                effect="pulse"
                style="width: 200px; margin-top: 16px;"
              ></sl-skeleton>
            `
          )}
        </div>
      `;

    if (!this._agentResourceBooking.value)
      return html`<div
        class="column"
        style="align-items: center; justify-content: center; flex: 1;"
      >
        <span class="placeholder">This agent hasn't created a resourceBooking yet</span>
      </div>`;

    return html`
      <div class="column">
        <div class="row" style="align-items: center">
          <agent-avatar .agentPubKey=${this.agentPubKey}></agent-avatar>
          <span style="font-size: 16px; margin-left: 8px;"
            >${this._agentResourceBooking.value.nickname}</span
          >

          <span style="flex: 1"></span>

          <slot name="action"></slot>
        </div>

        ${Object.entries(this.getAdditionalFields()).map(([key, value]) =>
          this.renderAdditionalField(key, value)
        )}
      </div>
    `;
  }

  /**
   * @ignore
   */
  static get scopedElements() {
    return {
      'agent-avatar': AgentAvatar,
      'sl-skeleton': SlSkeleton,
    };
  }

  static styles = [sharedStyles];
}
