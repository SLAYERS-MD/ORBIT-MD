export default {
  command: ["sticker", "s"],
  tags: "sticker",

  run: async (sock, m) => {
    if (!m.quoted) return
    await sock.sendMessage(m.chat, {
      sticker: await m.quoted.download()
    })
  }
}

