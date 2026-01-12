process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'

import './config.js'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import Pino from 'pino'
import { Boom } from '@hapi/boom'
import { fileURLToPath } from 'url'
import {
  default as makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'

import { Low, JSONFile } from 'lowdb'

/* ================= PATH ================= */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.__dirname = __dirname

/* ================= GLOBAL ================= */
global.opts = {}
global.db = { data: null }
global.plugins = {}
global.owner = [['5353023586', 'Owner', true]] // CAMBIA TU NÚMERO
global.mods = []
global.prefix = /^[.!/#]/

/* ================= DATABASE ================= */
const dbFile = path.join(__dirname, 'database.json')
const adapter = new JSONFile(dbFile)
const database = new Low(adapter)

global.loadDatabase = async () => {
  await database.read()
  database.data ||= {
    users: {},
    chats: {},
    settings: {},
    stats: {}
  }
  global.db.data = database.data
}
await global.loadDatabase()

setInterval(async () => {
  if (global.db?.data) await database.write()
}, 30_000)

/* ================= PLUGINS ================= */
const pluginsDir = path.join(__dirname, 'plugins')
for (const file of fs.readdirSync(pluginsDir).filter(v => v.endsWith('.js'))) {
  const plugin = await import(path.join(pluginsDir, file))
  global.plugins[file] = plugin.default || plugin
}

/* ================= START BOT ================= */
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('sessions')
  const { version } = await fetchLatestBaileysVersion()

  const conn = makeWASocket({
    auth: state,
    version,
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Orbit MD', 'Chrome', '1.0.0'],
    markOnlineOnConnect: true
  })

  global.conn = conn

  const handler = await import('./handler.js')

  conn.ev.on('messages.upsert', m => handler.handler.call(conn, m))
  conn.ev.on('messages.delete', d => handler.deleteUpdate?.call(conn, d))
  conn.ev.on('call', c => handler.callUpdate?.call(conn, c))
  conn.ev.on('creds.update', saveCreds)

  conn.ev.on('connection.update', update => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(chalk.green('✅ Orbit MD conectado correctamente'))
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode

      console.log(chalk.red('❌ Conexión cerrada:'), reason)

      if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red('Sesión cerrada. Elimina la carpeta sessions'))
        process.exit(0)
      } else {
        startBot()
      }
    }
  })
}

startBot()

/* ================= SAFETY ================= */
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err)
})


