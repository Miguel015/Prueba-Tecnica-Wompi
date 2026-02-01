import { PrismaService } from 'shared/infrastructure/prisma/prisma.service';
import { Customer, CustomerRepository, EnsureCustomerProps } from '../../domain/customer.repository';
export declare class PrismaCustomerRepository implements CustomerRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    ensureCustomer(props: EnsureCustomerProps): Promise<Customer>;
}
