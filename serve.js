const html = `
  <script>
    const ws = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host)
    ws.onopen = () => ws.send('Hello world')
    ws.onmessage = e => {
      if (e.data == '1') {
        counter.textContent = e.data + ' viewer.'
      } else {
        counter.textContent = e.data + ' viewers.'
      }
    }
  </script>
  
  
  <pre id='counter'>
`

const sockets = new Set()
const channel = new BroadcastChannel('')

channel.onmessage = e => {
  console.log(sockets.size)
  //channel.postMessage(sockets.size)
  sockets.forEach(s => s.send(sockets.size))
}

Deno.serve((r) => {
  try {
    const { socket, response } = Deno.upgradeWebSocket(r)
    sockets.add(socket)
    socket.onmessage = channel.onmessage
    socket.onclose = _ => {
      sockets.delete(socket)
      sockets.forEach(s => s.send(sockets.size))
    }
    return response
  } catch {
    return new Response(html, {headers: {'Content-type': 'text/html'}})
  }
})
