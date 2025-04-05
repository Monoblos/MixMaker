import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from 'url';
import { default as path, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  // prefix: '/public/', // optional: default '/'
  constraints: {
    // host: 'example.com'
  } // optional: default {}
});

fastify.listen({ port: 3000 }).catch((err) => {
  fastify.log.error(err)
  process.exit(1)
});