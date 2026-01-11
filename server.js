// server.js
import express from 'express'
import { createServer } from 'http'
import { default as makeWASocket, useMultiFileAuthState, DisconnectReason } from '@adiwajshing/baileys'
import qrcodeTerminal from 'qrcode-terminal'
import { toBuffer } from 'qrcode'
import fetch from 'node-fetch'
import readline from 'readline'

// =================== CONFIG ===================
const NUMERO = '1234567890' // Número de WhatsApp
const BOT_NAME = 'ORBIT-MD'
const PORT = 3000          // Puerto del servidor QR
const KEEPALIVE = true     // Para Replit / despliegues web
// ==============================================

// Variables globales
let _qr = 'invalid'        // QR temporal
let client                 // Cliente Baileys

// =================== MENÚ TERMUX ===================
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
console.clear()
console.log(`\n===== ${BOT_NAME} =====`)
console.log('1️⃣  Escanear QR para vincular WhatsApp')
console.log('2️⃣  Usar sesión existente de número\n')

rl.question('Selecciona una opción (1 o 2): ', (opcion) => {
    if (opcion === '1') startBot({ modoQR: true })
    else if (opcion === '2') startBot({ modoQR: false })
    else {
        console.log('❌ Opción inválida. Saliendo...')
        rl.close()
        process.exit(0)
    }
    rl.close()
})

// =================== FUNCION PRINCIPAL ===================
async function startBot({ modoQR }) {
    // Cargar o crear sesión
    const { state, saveCreds } = await useMultiFileAuthState(`auth/${NUMERO}`)
    client = makeWASocket({ auth: state }) // NO printQRInTerminal

    // Escuchar conexión
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        // Guardar QR para servidor web
        if (qr) _qr = qr

        // Mostrar QR en terminal si modoQR
        if (modoQR && qr) {
            console.log('\n🔑 Escanea este QR con WhatsApp:\n')
            qrcodeTerminal.generate(qr, { small: true })
        }

        if (connection === 'open') console.log(`✅ ${BOT_NAME} conectado correctamente al número ${NUMERO}`)

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode
            console.log(`❌ Conexión cerrada:`, reason)
            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconectando...')
                startBot({ modoQR })
            } else {
                console.log(`⚠️ Sesión cerrada permanentemente. Escanea QR nuevamente.`)
            }
        }
    })

    // Guardar credenciales automáticamente
    client.ev.on('creds.update', saveCreds)

    // Mensajes entrantes (puedes añadir handler)
    client.ev.on('messages.upsert', (m) => {
        for (const msg of m.messages) {
            const text = msg?.message?.conversation || ''
            if (!text) continue
            console.log('📩 Mensaje recibido:', text)
        }
    })

    // Iniciar servidor web para QR
    startServer()
}

// =================== SERVIDOR WEB QR ===================
function startServer() {
    const app = express()
    const server = createServer(app)

    app.use(async (req, res) => {
        res.setHeader('content-type', 'image/png')
        res.end(await toBuffer(_qr))
    })

    server.listen(PORT, () => {
        console.log(`🌐 Servidor QR escuchando en http://localhost:${PORT}`)
        if (KEEPALIVE) keepAlive()
    })
}

// =================== KEEPALIVE ===================
function keepAlive() {
    const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    if (/(\/\/|\.)undefined\./.test(url)) return
    setInterval(() => fetch(url).catch(console.error), 5 * 60 * 1000)
}
