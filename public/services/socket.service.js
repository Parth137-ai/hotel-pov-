/**
 * Socket.io Service for Real-Time State Sync
 */

export const socket = typeof io !== 'undefined' ? io() : { on: () => {}, emit: () => {} };

export function initSocketListeners(callbacks) {
  socket.on('initialState', (state) => {
    callbacks.onInitialState(state);
  });

  socket.on('stateUpdated', (key, data) => {
    callbacks.onStateUpdated(key, data);
  });

  socket.on('tableStatusUpdated', (tid, data) => {
    callbacks.onTableStatusUpdated(tid, data);
  });

  socket.on('orderReady', (msg) => {
    callbacks.onOrderReady(msg);
  });
}

export function syncState(key, data) {
  socket.emit('syncState', key, data);
}

export function syncTableStatus(tid, data) {
  socket.emit('syncTableStatus', tid, data);
}

export function notifyOrderReady(msg) {
  socket.emit('orderReadyNotify', msg);
}
