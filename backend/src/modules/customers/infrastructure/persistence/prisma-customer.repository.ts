import { Injectable } from '@nestjs/common';
import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import {
  Customer,
  CustomerRepository,
  EnsureCustomerProps,
} from '../../domain/customer.repository';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureCustomer(props: EnsureCustomerProps): Promise<Customer> {
    const customer = await this.prisma.customer.upsert({
      where: { email: props.email },
      update: {
        name: props.name,
        documentNumber: props.documentNumber,
      },
      create: {
        name: props.name,
        email: props.email,
        documentNumber: props.documentNumber,
      },
    });

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      documentNumber: customer.documentNumber ?? undefined,
    };
  }
}
