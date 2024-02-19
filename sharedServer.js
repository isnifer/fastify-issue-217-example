async function checkGroup(fastify) {
  fastify.decorate("checkGroup", (group) => {
    return async (request, reply) => {
      // IMPORTANT: USER SHOULD BE A PART OF BOTH GROUPS
      const groups = request.headers["groups"]?.split(",") ?? [];
      if (!groups.includes(group)) {
        throw new Error(`Group not allowed: ${group}`);
      }
    };
  });
}

async function checkClientPermissions(fastify) {
  fastify.decorate("checkClientPermissions", (...requiredPermissions) => {
    return async (request, reply) => {
      console.log("SHOULD NOT BE CALLED AT ALL");
      console.dir({ ...request.query });

      if (!requiredPermissions.includes(request.query.role)) {
        throw new Error("You don't have permission to access this resource");
      }
    };
  });
}

async function sharedServer(fastify, fastifyAuth, fastifyPlugin, port = 3000) {
  const checkGroupPlugin = fastifyPlugin(checkGroup);
  const checkClientPermissionsPlugin = fastifyPlugin(checkClientPermissions);

  const app = fastify();
  await app.register(checkGroupPlugin);
  await app.register(checkClientPermissionsPlugin);
  await app.register(fastifyAuth, { defaultRelation: "or" });

  // Declare a route
  app.get("/", {
    preHandler: app.auth(
      [
        [app.checkGroup("admins")],
        [
          app.checkGroup("clients"),
          app.checkClientPermissions("ADMIN", "MANAGER", "ANALYST"),
        ],
      ],
      { relation: "or" }
    ),
    handler: (request, reply) => {
      reply.send({ hello: "world" });
    },
  });

  // Run the server!
  app.listen({ host: "127.0.0.1", port }, (err, address) => {
    if (err) throw err;
    console.log(`Server is now listening on ${address}`);
  });
}

module.exports = sharedServer;
