import { html, LitElement } from 'lit';
import { query, property, state } from 'lit/decorators.js';
import { contextProvided } from '@holochain-open-dev/context';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Dictionary } from '@holochain-open-dev/core-types';
import {
  TextField,
  Button,
  Card,
  IconButton,
  Fab,
  CircularProgress,
} from '@scoped-elements/material-web';
import { SlAvatar } from '@scoped-elements/shoelace';

import { sharedStyles } from './utils/shared-styles';
import { ResourceStore } from '../resource-store';
import { resourceStoreContext } from '../context';
import { resizeAndExport } from './utils/image';
import { EditResourceBooking } from './edit-resource-booking';
import { ResourceBooking } from '../types';
import { StoreSubscriber } from 'lit-svelte-stores';

/**
 * @element update-resource-booking
 * @fires resource-booking-updated - Fired after the resourceBooking has been created. Detail will have this shape: { resourceBooking: { nickname, fields } }
 */
export class UpdateResourceBooking extends ScopedElementsMixin(LitElement) {
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

  private _myResourceBooking = new StoreSubscriber(this, () => this.store?.myResourceBooking);

  async firstUpdated() {
    await this.store.fetchMyResourceBooking();
    this._loading = false;
  }

  async updateResourceBooking(resourceBooking: ResourceBooking) {
    await this.store.updateResourceBooking(resourceBooking);

    this.dispatchEvent(
      new CustomEvent('resource-booking-updated', {
        detail: {
          resourceBooking,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (this._loading)
      return html`<div
        class="column"
        style="align-items: center; justify-content: center; flex: 1;"
      >
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;

    return html`
      <edit-resource-booking
        .resourceBooking=${this._myResourceBooking.value}
        save-resource-booking-label="Update ResourceBooking"
        @save-resource-booking=${(e: CustomEvent) =>
          this.updateResourceBooking(e.detail.resourceBooking)}
      ></edit-resource-booking>
    `;
  }

  /**
   * @ignore
   */
  static get scopedElements() {
    return {
      'mwc-circular-progress': CircularProgress,
      'edit-resource-booking': EditResourceBooking,
      'mwc-card': Card,
    };
  }
  static get styles() {
    return [sharedStyles];
  }
}