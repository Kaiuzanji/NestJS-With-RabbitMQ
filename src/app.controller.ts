import { Controller, Get, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext, RmqRecordBuilder } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('ORDER_QUEUE') private orderQueue: ClientProxy,
    private readonly appService: AppService
  ) {}

  @Get('/:message')
  getHello(@Param('message') message: string): string {
    const record = new RmqRecordBuilder(message).build();

    this.orderQueue.send('process', record).subscribe();
    
    return this.appService.getHello();
  }

  @MessagePattern('process')
  async processOrder(@Payload() message: string, @Ctx() context: RmqContext) {
    console.log('Received message ', message)
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
