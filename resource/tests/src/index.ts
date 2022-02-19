import { Config, InstallAgentsHapps, Orchestrator } from "@holochain/tryorama";
import Base64 from "js-base64";
import path from "path";

const conductorConfig = Config.gen();

// Construct proper paths for your DNAs
const resourceDna = path.join(__dirname, "../../workdir/dna/resource-test.dna");

// create an InstallAgentsHapps array with your DNAs to tell tryorama what
// to install into the conductor.
const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [resourceDna],
  ],
  [
    // happ 0
    [resourceDna],
  ],
];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(() => resolve(null), ms));

function serializeHash(hash) {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

const zomeName = 'resource';

let orchestrator = new Orchestrator();

orchestrator.registerScenario("create a resourceBooking and get it", async (s, t) => {
  const [alice, bob] = await s.players([conductorConfig]);

  // install your happs into the coductors and destructuring the returned happ data using the same
  // array structure as you created in your installation array.
  const [[alice_resource_bookings], [bob_resource_bookings]] = await alice.installAgentsHapps(
    installation
  );


  let alicePubkeyB64 = serializeHash(alice_resource_bookings.agent);
  let bobPubKeyB64 = serializeHash(bob_resource_bookings.agent);

  let myResourceBooking = await alice_resource_bookings.cells[0].call(
    zomeName,
    "get_my_resource_booking",
    null
  );
  t.notOk(myResourceBooking);

  let resourceBookingHash = await alice_resource_bookings.cells[0].call(
    zomeName,
    "create_resource_booking",
    {
      nickname: "alice",
      fields: {
        avatar: "aliceavatar",
      },
    }
  );
  t.ok(resourceBookingHash);

  await sleep(500);

  // set nickname as alice to make sure bob's is not getting deleted
  // with alice's update
  resourceBookingHash = await bob_resource_bookings.cells[0].call(zomeName, "create_resource_booking", {
    nickname: "alice_bob",
    fields: {
      avatar: "bobboavatar",
    },
  });
  t.ok(resourceBookingHash);

  await sleep(5000);

  resourceBookingHash = await alice_resource_bookings.cells[0].call(
    zomeName,
    "update_resource_booking",
    {
      nickname: "alice2",
      fields: {
        avatar: "aliceavatar2",
        update: "somenewfield",
      },
    }
  );
  t.ok(resourceBookingHash);

  myResourceBooking = await alice_resource_bookings.cells[0].call(
    zomeName,
    "get_my_resource_booking",
    null
  );
  t.ok(myResourceBooking.agentPubKey);
  t.equal(myResourceBooking.resourceBooking.nickname, "alice2");

  let allresource = await bob_resource_bookings.cells[0].call(
    zomeName,
    "get_all_resource_bookings",
    null
  );
  t.equal(allresource.length, 2);

  let multipleResource = await bob_resource_bookings.cells[0].call(
    zomeName,
    "get_agents_resource_booking",
    [alicePubkeyB64, bobPubKeyB64]
  );
  t.equal(multipleResource.length, 2);

  let resource = await bob_resource_bookings.cells[0].call(
    zomeName,
    "search_resource_bookings",
    {
      nicknamePrefix: "sdf",
    }
  );
  t.equal(resource.length, 0);

  resource = await bob_resource_bookings.cells[0].call(zomeName, "search_resource_bookings", {
    nicknamePrefix: "alic",
  });
  t.equal(resource.length, 2);
  t.ok(resource[0].agentPubKey);
  t.equal(resource[1].resourceBooking.nickname, "alice2");

  resource = await bob_resource_bookings.cells[0].call(zomeName, "search_resource_bookings", {
    nicknamePrefix: "ali",
  });
  t.equal(resource.length, 2);
  t.ok(resource[0].agentPubKey);
  t.equal(resource[1].resourceBooking.nickname, "alice2");
  t.equal(resource[1].resourceBooking.fields.avatar, "aliceavatar2");

  resource = await bob_resource_bookings.cells[0].call(zomeName, "search_resource_bookings", {
    nicknamePrefix: "alice",
  });
  t.equal(resource.length, 2);
  t.ok(resource[1].agentPubKey);
  t.equal(resource[1].resourceBooking.nickname, "alice2");

  resource = await bob_resource_bookings.cells[0].call(zomeName, "search_resource_bookings", {
    nicknamePrefix: "alice_",
  });
  t.equal(resource.length, 2);
  t.ok(resource[0].agentPubKey);
  t.equal(resource[0].resourceBooking.nickname, "alice_bob");
  t.equal(resource[0].resourceBooking.fields.avatar, "bobboavatar");
});

orchestrator.run();
orchestrator = new Orchestrator();

orchestrator.registerScenario(
  "create a resourceBooking with upper case and search it with lower case",
  async (s, t) => {
    const [alice, bob] = await s.players([conductorConfig]);

    // install your happs into the coductors and destructuring the returned happ data using the same
    // array structure as you created in your installation array.
    const [[alice_resource_bookings], [bob_resource_bookings]] = await alice.installAgentsHapps(
      installation
    );

    let resourceBookingHash = await alice_resource_bookings.cells[0].call(
      zomeName,
      "create_resource_booking",
      {
        nickname: "ALIce",
        fields: {
          avatar: "aliceavatar",
        },
      }
    );
    t.ok(resourceBookingHash);
    await sleep(5000);

    let resource = await bob_resource_bookings.cells[0].call(
      zomeName,
      "search_resource_bookings",
      {
        nicknamePrefix: "ali",
      }
    );
    t.equal(resource.length, 1);
    t.ok(resource[0].agentPubKey);
    t.equal(resource[0].resourceBooking.nickname, "ALIce");

    resource = await bob_resource_bookings.cells[0].call(zomeName, "search_resource_bookings", {
      nicknamePrefix: "aLI",
    });
    t.equal(resource.length, 1);
    t.ok(resource[0].agentPubKey);
    t.equal(resource[0].resourceBooking.nickname, "ALIce");

    resource = await bob_resource_bookings.cells[0].call(zomeName, "search_resource_bookings", {
      nicknamePrefix: "AlI",
    });
    t.equal(resource.length, 1);
    t.ok(resource[0].agentPubKey);
    t.equal(resource[0].resourceBooking.nickname, "ALIce");

    resource = await bob_resource_bookings.cells[0].call(zomeName, "search_resource_bookings", {
      nicknamePrefix: "ALI",
    });
    t.equal(resource.length, 1);
    t.ok(resource[0].agentPubKey);
    t.equal(resource[0].resourceBooking.nickname, "ALIce");
  }
);

orchestrator.run();
