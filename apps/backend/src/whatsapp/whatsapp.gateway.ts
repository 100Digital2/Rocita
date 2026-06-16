import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Habilita CORS para el frontend en Next.js
  },
  namespace: 'whatsapp',
})
export class WhatsappGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente WS conectado al namespace whatsapp: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente WS desconectado del namespace whatsapp: ${client.id}`);
  }

  emitQr(qrBase64: string) {
    this.server.emit('whatsapp.qr', { qr: qrBase64 });
  }

  emitStatus(status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED') {
    this.server.emit('whatsapp.status', { status });
  }

  emitMessage(message: any) {
    this.server.emit('whatsapp.message', message);
  }
}
