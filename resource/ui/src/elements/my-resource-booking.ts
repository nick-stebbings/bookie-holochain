import { contextProvided } from '@holochain-open-dev/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import { resourceStoreContext } from '../context';
import { ResourceStore } from '../resource-store';
import { sharedStyles } from './utils/shared-styles';
import { EditBookableResource } from './edit-resource-booking';
import { BookableResourceDetail } from './resource-booking-detail';
import { IconButton } from '@scoped-elements/material-web';
import { UpdateBookableResource } from './update-resource-booking';

/**
 * @element resource-booking-detail
 */
export class MyBookableResource extends ScopedElementsMixin(LitElement) {
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
  private _editing = false;

  render() {
    if (this._editing)
      return html`<update-resource-booking
        @resource-booking-updated=${() => (this._editing = false)}
      ></update-resource-booking>`;

    return html`
      <resource-booking-detail .agentPubKey=${this.store.myAgentPubKey}>
        <mwc-icon-button
          slot="action"
          icon="edit"
          @click=${() => (this._editing = true)}
        ></mwc-icon-button>
      </resource-booking-detail>
    `;
  }

  /**
   * @ignore
   */
  static get scopedElements() {
    return {
      'mwc-icon-button': IconButton,
      'resource-booking-detail': BookableResourceDetail,
      'update-resource-booking': UpdateBookableResource,
    };
  }

  static styles = [sharedStyles];
}
