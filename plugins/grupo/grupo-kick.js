export default {
  command: ["kick"],
  tags: "grupo",
  admin: true,
  group: true,

  run: async (sock, m) => {
    const user = m.mentionedJid?.[0]
    if (!user) return sock.sendMessage(m.chat, { text: "Menciona a alguien" })
    await sock.groupParticipantsUpdate(m.chat, [user], "remove")
  }
}
