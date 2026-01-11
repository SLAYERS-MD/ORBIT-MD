import fs from "fs"
import path from "path"
import { config } from "./config.js"

const pluginFiles = []

function load(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file)
    if (fs.statSync(full).isDirectory()) load(full)
    else if (file.endsWith(".js") && !file.startsWith("_"))
      pluginFiles.push(full)
  }
}

load("./plugins")

const plugins = await Promise.all(
  pluginFiles.map(f => import(`./${f}`))
)

export default async function handler(sock, m) {
  const text = m.text || ""
  const prefix = config.prefix.find(p => text.startsWith(p))
  if (!prefix) return

  const args = text.slice(prefix.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  for (const p of plugins) {
    const plugin = p.default
    if (plugin.command?.includes(command)) {
      return plugin.run(sock, m, {
        args,
        text: args.join(" "),
        prefix,
        command,
        config
      })
    }
  }
}

