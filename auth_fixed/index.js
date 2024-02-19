const fastify = require("fastify");
const fastifyAuth = require("@fastify/auth");
const fastifyPlugin = require("fastify-plugin");
const sharedServer = require("../sharedServer");

sharedServer(fastify, fastifyAuth, fastifyPlugin, 3460);
