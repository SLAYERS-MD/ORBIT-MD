import fs from "fs"

const DB_PATH = "./storage/database.json"

export function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {}, groups: {} }, null, 2))
  }
  return JSON.parse(fs.readFileSync(DB_PATH))
}

export function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}
