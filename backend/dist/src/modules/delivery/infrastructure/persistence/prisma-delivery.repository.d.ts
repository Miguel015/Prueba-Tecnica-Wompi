import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import { CreateDeliveryProps, DeliveryRepository } from '../../domain/delivery.repository';
export declare class PrismaDeliveryRepository implements DeliveryRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(props: CreateDeliveryProps): Promise<void>;
}
