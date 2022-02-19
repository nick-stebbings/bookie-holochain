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
} from '@scoped-elements/material-web';
import { SlAvatar } from '@scoped-elements/shoelace';

import { sharedStyles } from './utils/shared-styles';
import { ResourceStore } from '../resource-store';
import { resourceStoreContext } from '../context';
import { resizeAndExport } from './utils/image';
import { EditResourceBooking } from './edit-resource-booking';
import { ResourceBooking } from '../types';

/**
 * A custom element that fires event on value change.
 *
 * @element create-resource-booking
 * @fires resource-booking-created - Fired after the resourceBooking has been created. Detail will have this shape: { resourceBooking: { nickname, fields } }
 */
export class CreateResourceBooking extends ScopedElementsMixin(LitElement) {
  /** Dependencies */

  /**
   * `ResourceStore` that is requested via context.
   * Only set this property if you want to override the store requested via context.
   */
  @contextProvided({ context: resourceStoreContext })
  @property({ type: Object })
  store!: ResourceStore;

  /** Private properties */

  async createResourceBooking(resourceBooking: ResourceBooking) {
    await this.store.createResourceBooking(resourceBooking);

    this.dispatchEvent(
      new CustomEvent('resource-booking-created', {
        detail: {
          resourceBooking,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <mwc-card>
        <div class="column" style="margin: 16px;">
          <span
            class="title"
            style="margin-bottom: 24px; align-self: flex-start"
            >Create ResourceBooking</span
          >
          <edit-resource-booking
            save-resource-booking-label="Create ResourceBooking"
            @save-resource-booking=${(e: CustomEvent) =>
              this.createResourceBooking(e.detail.resourceBooking)}
          ></edit-resource-booking></div
      ></mwc-card>
    `;
  }

  /**
   * @ignore
   */
  static get scopedElements() {
    return {
      'edit-resource-booking': EditResourceBooking,
      'mwc-card': Card,
    };
  }
  static get styles() {
    return [sharedStyles];
  }
}
