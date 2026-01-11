export default {
  command: ["antilink"],
  tags: "config",
  admin: true,
  group: true,

  run: async (sock, m, { args }) => {
    const db = global.db
    const gid = m.chat
    db.groups[gid] = db.groups[gid] || {}
    db.groups[gid].antilink = args[0] === "on"

    await sock.sendMessage(gid, {
      text: `🔗 Anti-Link ${db.groups[gid].antilink ? "ACTIVADO" : "DESACTIVADO"}`
    })
  }
}

