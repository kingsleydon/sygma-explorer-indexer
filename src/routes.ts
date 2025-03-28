/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import fs from "node:fs/promises"
import { FastifyInstance } from "fastify"
import { TransfersController } from "./controllers/TransfersController"
import {
  domainsMetadataSchema,
  resourcesByDomainSchema,
  routesByDomainSchema,
  transferByIdSchema,
  transferByTxHashAndDomainSchema,
  transfersByDomainSchema,
  transfersByResourceBetweenDomainsSchema,
  transfersByResourceSchema,
  transfersBySenderSchema,
  transfersBySourceDomainToDestinationDomainSchema,
  transfersSchema,
} from "./controllers/schemas"
import { RoutesController } from "./controllers/RoutesController"
import { DomainsController } from "./controllers/DomainController"

// eslint-disable-next-line @typescript-eslint/require-await
export async function routes(fastify: FastifyInstance): Promise<void> {
  fastify.route({
    method: "GET",
    url: "/transfers",
    schema: transfersSchema,
    handler: TransfersController.transfers,
  })

  fastify.route({
    method: "GET",
    url: "/transfers/:id",
    schema: transferByIdSchema,
    handler: TransfersController.transferById,
  })

  fastify.route({
    method: "GET",
    url: "/transfers/txHash/:txHash",
    schema: transferByTxHashAndDomainSchema,
    handler: TransfersController.transferByTxHash,
  })

  fastify.route({
    method: "GET",
    url: "/sender/:senderAddress/transfers",
    schema: transfersBySenderSchema,
    handler: TransfersController.transfersBySender,
  })

  fastify.route({
    method: "GET",
    url: "/resources/:resourceID/transfers",
    schema: transfersByResourceSchema,
    handler: TransfersController.transfersByResource,
  })

  fastify.route({
    method: "GET",
    url: "/domains/source/:sourceDomainID/destination/:destinationDomainID/transfers",
    schema: transfersBySourceDomainToDestinationDomainSchema,
    handler: TransfersController.transfersBySourceDomainToDestinationDomain,
  })

  fastify.route({
    method: "GET",
    url: "/resources/:resourceID/domains/source/:sourceDomainID/destination/:destinationDomainID/transfers",
    schema: transfersByResourceBetweenDomainsSchema,
    handler: TransfersController.transfersByResourceBetweenDomains,
  })

  fastify.route({
    method: "GET",
    url: "/domains/:domainID/transfers",
    schema: transfersByDomainSchema,
    handler: TransfersController.transfersByDomain,
  })

  fastify.route({
    method: "GET",
    url: "/domains/metadata",
    schema: domainsMetadataSchema,
    handler: DomainsController.domainsMetadata,
  })

  fastify.route({
    method: "GET",
    url: "/routes/from/:domainID",
    schema: routesByDomainSchema,
    handler: RoutesController.routes,
  })

  fastify.route({
    method: "GET",
    url: "/domains/:domainID/resources",
    schema: resourcesByDomainSchema,
    handler: DomainsController.resources,
  })

  fastify.route({
    method: "GET",
    url: "/grafana-bridge-explorer",
    handler: async (request, reply) => {
      const json = await fs.readFile("transfers.json", "utf-8")
      void reply.status(200).send(json)
    },
  })
}
