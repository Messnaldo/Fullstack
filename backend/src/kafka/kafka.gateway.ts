

import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as csvWriter from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
@WebSocketGateway({
  cors: {
    origin: '*', // Angular app URL
    methods: ['GET', 'POST'],
    credentials: false,
    pingTimeout: 10000, // Set ping timeout to 10 seconds
  pingInterval: 25000, 
  },
})
export class KafkaGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  sendMessageToClients(message: any) {
    console.log('Sending message to clients:', message);
    this.server.emit('message', message);
  }
}

