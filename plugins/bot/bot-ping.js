export default {
  command: ["ping"],
  tags: "bot",
  desc: "Estado del bot",

  run: async (sock, m) => {
    await sock.sendMessage(m.chat, { text: "🛰️ ORBIT-MD activo" })
  }
}
