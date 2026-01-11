import http from "http"

http.createServer((req, res) => {
  res.writeHead(200)
  res.end("ORBIT-MD ONLINE")
}).listen(3000)

