import fs from "fs"
import path from "path"

export function loadPlugins() {
  const dir = path.resolve("./plugins")
  return fs.readdirSync(dir).filter(f => f.endsWith(".js"))
}

