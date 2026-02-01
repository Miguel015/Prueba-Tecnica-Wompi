export interface EnsureCustomerProps {
    name: string;
    email: string;
    documentNumber?: string;
}
export interface Customer {
    id: string;
    name: string;
    email: string;
    documentNumber?: string | null;
}
export declare abstract class CustomerRepository {
    abstract ensureCustomer(props: EnsureCustomerProps): Promise<Customer>;
}
