import { KVStore } from './kv_store';
import { Server } from './server';

const kvStore = new KVStore();

const server: Server = new Server(kvStore);

server.start(3000);
