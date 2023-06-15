import { ApiPromise, WsProvider } from "@polkadot/api"
import { Domain } from "indexer/config"
import DomainRepository from "../../repository/domain"
import { logger } from "../../../utils/logger"

export class SubstrateIndexer {
  private domainRepository: DomainRepository
  private pastEventsQueryInterval = 2000
  private currentEventsQueryInterval = 10
  private provider!: ApiPromise
  private domain: Domain
  constructor(domainRepository: DomainRepository, domain: Domain) {
    this.domainRepository = domainRepository
    this.domain = domain
  }
  async init(rpcUrl: string): Promise<void> {
    const wsProvider = new WsProvider(rpcUrl)
    this.provider = await ApiPromise.create({
      provider: wsProvider,
    })
  }

  async indexPastEvents(): Promise<number> {
    const lastIndexedBlock = await this.getLastIndexedBlock(this.domain.id.toString())

    let toBlock = this.domain.startBlock + this.pastEventsQueryInterval

    let latestBlock = Number((await this.provider.rpc.chain.getBlock()).block.header.number)

    let fromBlock = this.domain.startBlock

    if (lastIndexedBlock && lastIndexedBlock > this.domain.startBlock) {
      // move 1 block from last processed db block
      fromBlock = lastIndexedBlock + 1
    }

    logger.info(`Starting querying past blocks on ${this.domain.name}`)
    do {
      try {
        latestBlock = Number((await this.provider.rpc.chain.getBlock()).block.header.number)
        // check block range for getting logs query exceeds latestBlock on network
        // if true -> get logs until that block, else query next range of blocks
        if (fromBlock + this.pastEventsQueryInterval >= latestBlock) {
          toBlock = latestBlock
        } else {
          toBlock = fromBlock + this.pastEventsQueryInterval
        }

        await this.saveDataToDb(this.domain.id, toBlock.toString())
        // move to next range of blocks
        fromBlock += this.pastEventsQueryInterval
        toBlock += this.pastEventsQueryInterval
      } catch (error) {
        logger.error(`Failed to process past events because of: ${(error as Error).message}`)
      }
    } while (fromBlock < latestBlock)
    // move to next block from the last queried range in past events
    return latestBlock + 1
  }

  async listenToEvents(): Promise<void> {
    logger.info(`Starting querying current blocks for events on ${this.domain.name}`)
    let latestBlock = await this.indexPastEvents()
    await this.provider.rpc.chain.subscribeNewHeads(async header => {
      // start at last block from past events query and move to new blocks range
      if (latestBlock + this.currentEventsQueryInterval === Number(header.number)) {
        // connect executions to deposits
        try {
          // fetch and decode logs

          await this.saveDataToDb(this.domain.id, header.number.toString())
          // move to next range of blocks
          latestBlock += this.currentEventsQueryInterval
        } catch (error) {
          logger.error(`Failed to process current events because of: ${(error as Error).message}`)
        }
      }
    })
  }

  async saveDataToDb(domainID: number, latestBlock: string): Promise<void> {
    logger.info(`save block on substrate ${this.domain.name}: ${latestBlock}`)
    await this.domainRepository.updateBlock(latestBlock, domainID)
  }

  async getLastIndexedBlock(domainID: string): Promise<number> {
    const domainRes = await this.domainRepository.getLastIndexedBlock(domainID)

    return domainRes ? Number(domainRes.lastIndexedBlock) : 0
  }
}