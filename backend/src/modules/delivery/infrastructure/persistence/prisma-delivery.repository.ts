import { Injectable } from '@nestjs/common';
import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import {
  CreateDeliveryProps,
  DeliveryRepository,
} from '../../domain/delivery.repository';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(props: CreateDeliveryProps): Promise<void> {
    await this.prisma.delivery.create({
      data: {
        customerId: props.customerId,
        productId: props.productId,
        transactionId: props.transactionId,
        address: props.address,
        status: 'PENDING',
      },
    });
  }
}
