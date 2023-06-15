import { Provider, Log } from "ethers"
import { Domain, Resource } from "../../config"
import { getDecodedLogs } from "../../../utils/indexer"
import { logger } from "../../../utils/logger"
import { DecodedLogs } from "./evmTypes"

export const nativeTokenAddress = "0x0000000000000000000000000000000000000000"

export async function decodeLogs(provider: Provider, domain: Domain, logs: Log[], resourceMap: Map<string, Resource>): Promise<DecodedLogs> {
  const decodedLogs: DecodedLogs = {
    deposit: [],
    proposalExecution: [],
    errors: [],
    feeCollected: [],
  }
  await Promise.all(
    logs.map(async log => {
      try {
        await getDecodedLogs(log, provider, domain, resourceMap, decodedLogs)
      } catch (e) {
        logger.error(e)
      }
    }),
  )

  return decodedLogs
}