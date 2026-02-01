import { InternalTransactionStatus } from '../../domain/transaction-status.enum';
import { CreatePaymentTransactionUseCase } from './create-payment-transaction.usecase';

jest.mock('@prisma/client', () => {
	const mockUpdate = jest.fn().mockResolvedValue(undefined);
	const mockDisconnect = jest.fn().mockResolvedValue(undefined);

	return {
		PrismaClient: jest.fn().mockImplementation(() => ({
			stock: { update: mockUpdate },
			$disconnect: mockDisconnect,
		})),
	};
});

describe('CreatePaymentTransactionUseCase', () => {
	function buildUseCase(overrides?: Partial<{
		product: any;
		wompiStatus: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
	}>) {
		const product =
			overrides?.product ??
			({
				id: 'prod-1',
				name: 'Test product',
				description: 'Test',
				price: 2000,
				stockAvailable: 5,
			} as any);

		const productRepository = {
			findById: jest.fn().mockResolvedValue(product),
		} as any;

		const customer = {
			id: 'cust-1',
			name: 'Miguel Suarez',
			email: 'miguel@example.com',
		};

		const customerRepository = {
			ensureCustomer: jest.fn().mockResolvedValue(customer),
		} as any;

		const deliveryRepository = {
			create: jest.fn().mockResolvedValue(undefined),
		} as any;

		const baseTx = {
			id: 'tx-1',
			productId: product.id,
			customerId: customer.id,
			status: InternalTransactionStatus.PENDING,
			amount: product.price,
			baseFee: 5,
			deliveryFee: 10,
			total: product.price + 5 + 10,
		};

		const transactionRepository = {
			create: jest.fn().mockResolvedValue(baseTx),
			updateStatus: jest.fn().mockImplementation((props: any) =>
				Promise.resolve({
					...baseTx,
					status: props.status,
					wompiReference: props.wompiReference,
				}),
			),
		} as any;

		const paymentGateway = {
			charge: jest.fn().mockResolvedValue({
				status: overrides?.wompiStatus ?? 'PENDING',
				wompiReference: 'wompi-123',
			}),
		} as any;

		const useCase = new CreatePaymentTransactionUseCase(
			productRepository,
			customerRepository,
			deliveryRepository,
			transactionRepository,
			paymentGateway,
		);

		const command = {
			productId: product.id,
			customer: { name: 'Miguel Suarez', email: 'miguel@example.com' },
			delivery: { address: 'Street 123' },
			card: {
				number: '4111111111111111',
				expMonth: '12',
				expYear: '40',
				cvc: '123',
				cardHolderName: 'MIGUEL SUAREZ',
			},
		} as const;

		return {
			useCase,
			productRepository,
			customerRepository,
			deliveryRepository,
			transactionRepository,
			paymentGateway,
			command,
		};
	}

	it('should return error when product is not available', async () => {
		const { useCase, productRepository, command } = buildUseCase({
			product: { id: 'prod-1', price: 2000, stockAvailable: 0 },
		});

		(productRepository.findById as jest.Mock).mockResolvedValueOnce({
			id: 'prod-1',
			price: 2000,
			stockAvailable: 0,
		});

		const result: any = await useCase.execute(command as any);

		expect(result.isErr).toBe(true);
		expect(result.error.message).toContain('Product not available');
	});

	it('should create a transaction and map APPROVED status', async () => {
		const { useCase, transactionRepository, paymentGateway, command } =
			buildUseCase({ wompiStatus: 'APPROVED' });

		const result: any = await useCase.execute(command as any);

		expect(paymentGateway.charge).toHaveBeenCalled();
		expect(transactionRepository.updateStatus).toHaveBeenCalled();
		expect(result.isOk).toBe(true);
		expect(result.value.status).toBe(InternalTransactionStatus.APPROVED);
	});

	it('should fail fast when input validation is invalid', async () => {
		const { useCase, command } = buildUseCase();

		const badCommand: any = {
			...command,
			customer: { name: 'J', email: 'bad-email' },
		};

		const result: any = await useCase.execute(badCommand);

		expect(result.isErr).toBe(true);
		expect(result.error.message).toContain('Customer name');
	});
});
