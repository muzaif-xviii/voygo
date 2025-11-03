/* realtime.js - socket connection for price updates */
let socket;
function startRealtime(){
  socket = io('/realtime');
  socket.on('connect', ()=> console.log('Realtime connected'));
  socket.on('price_update', data => {
    // UI hook: you can show toasts or update DOM
    console.log('price update', data);
    showToast(`${data.type} price change: ${data.id} -> ₹${data.price}`);
  });
}
function stopRealtime(){ if(socket) socket.disconnect(); }
