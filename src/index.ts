/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import fs from "node:fs/promises"
import { CronJob } from "cron"
import { app } from "./app"

const PORT: number = Number(process.env.PORT!) || 8000

app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  console.log(`⚡️[server]: Server is running at ${address}`)
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-misused-promises
const job = new CronJob("* * * * *", async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await fetch(
    "http://0.0.0.0:8000/resources/0x0000000000000000000000000000000000000000000000000000000000000001/transfers?limit=2000",
  ).then(res => res.json())

  for (const item of json) {
    delete item.resourceID
    delete item.fromDomainId
    delete item.toDomainId
    delete item.resource
    delete item.deposit.depositData
    delete item.fee.resourceID
  }
  await fs.writeFile("transfers.json", JSON.stringify(json))
})

job.start()
