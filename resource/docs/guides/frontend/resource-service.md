# Frontend Docs >> ResourceService ||30

The `ResourceService` is a state-less class that provides typings wrapping the zome calls that can be made to `hc_zome_resource_bookings`.

```js
import { ResourceService } from '@holochain-open-dev/resource';

const service = new ResourceService(cellClient);

service.getMyResourceBooking().then(myResourceBooking => console.log(myResourceBooking));
```

Learn more about the services [here](https://holochain-open-dev.github.io/reusable-modules/frontend/using/#services). 