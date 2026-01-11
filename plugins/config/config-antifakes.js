export default {
  command: ["antifake"],
  tags: "config",
  admin: true,
  group: true,

  run: async (sock, m, { args }) => {
    const db = global.db
    const gid = m.chat
    db.groups[gid] = db.groups[gid] || {}
    db.groups[gid].antifake = args[0] === "on"

    await sock.sendMessage(gid, {
      text: `🛡️ Anti-Fake ${db.groups[gid].antifake ? "ACTIVADO" : "DESACTIVADO"}`
    })
  }
}

