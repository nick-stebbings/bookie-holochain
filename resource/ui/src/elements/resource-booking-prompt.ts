import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import {
  Button,
  CircularProgress,
  TextField,
} from '@scoped-elements/material-web';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { contextProvided } from '@holochain-open-dev/context';
import { StoreSubscriber } from 'lit-svelte-stores';

import { sharedStyles } from './utils/shared-styles';
import { CreateBookableResource } from './create-resource-booking';
import { ResourceStore } from '../resource-store';
import { resourceStoreContext } from '../context';

/**
 * @element resource-booking-prompt
 * @slot hero - Will be displayed above the create-resource-booking form when the user is prompted with it
 */
export class BookableResourcePrompt extends ScopedElementsMixin(LitElement) {
  /** Public attributes */

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

  private _myBookableResource = new StoreSubscriber(this, () => this.store?.myBookableResource);

  async firstUpdated() {
    await this.store.fetchMyBookableResource();
    this._loading = false;
  }

  renderPrompt() {
    return html` <div
      class="column"
      style="align-items: center; justify-content: center; flex: 1;"
    >
      ${this._loading
        ? html`<mwc-circular-progress indeterminate></mwc-circular-progress>`
        : html` <div class="column" style="align-items: center;">
            <slot name="hero"></slot>
            <create-resource-booking></create-resource-booking>
          </div>`}
    </div>`;
  }

  render() {
    return html`
      ${!this._loading && this._myBookableResource.value
        ? html`<slot></slot>`
        : this.renderPrompt()}
    `;
  }

  /**
   * @ignore
   */
  static get scopedElements() {
    return {
      'mwc-textfield': TextField,
      'mwc-button': Button,
      'mwc-circular-progress': CircularProgress,
      'create-resource-booking': CreateBookableResource,
    };
  }

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: flex;
        }
      `,
    ];
  }
}
