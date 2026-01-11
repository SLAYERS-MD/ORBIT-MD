export default {
  custom: true,

  run: async (sock, m) => {
    const db = global.db
    const text = m.text || ""
    const gid = m.chat

    // ANTI-PRIVADO
    if (!gid.endsWith("@g.us") && global.config.antiPrivate) {
      await sock.sendMessage(gid, { text: "❌ No escribas al privado." })
      return
    }

    // ANTI-LINK
    if (gid.endsWith("@g.us") && db.groups?.[gid]?.antilink) {
      if (/https?:\/\//i.test(text)) {
        await sock.sendMessage(gid, {
          text: "🚫 Links no permitidos"
        })
        await sock.groupParticipantsUpdate(gid, [m.sender], "remove")
      }
    }

    // ANTI-FAKE
    if (gid.endsWith("@g.us") && db.groups?.[gid]?.antifake) {
      if (!m.sender.startsWith("+53")) {
        await sock.groupParticipantsUpdate(gid, [m.sender], "remove")
      }
    }
  }
}
