import axios from 'axios';
import { WompiHttpAdapter } from './wompi-http.adapter';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WompiHttpAdapter', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...ORIGINAL_ENV,
      WOMPI_BASE_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
      WOMPI_PUBLIC_KEY: 'pub_test',
      WOMPI_PRIVATE_KEY: 'prv_test',
      WOMPI_INTEGRITY_KEY: 'integrity_test',
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('calls Wompi endpoints and maps APPROVED status', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: {
          presigned_acceptance: { acceptance_token: 'accept-token' },
        },
      },
    });

    mockedAxios.post
      .mockResolvedValueOnce({
        data: { data: { id: 'card-token-1' } },
      })
      .mockResolvedValueOnce({
        data: { data: { id: 'wompi-tx-1', status: 'APPROVED' } },
      });

    const adapter = new WompiHttpAdapter();

    const result = await adapter.charge({
      amountInCents: 1000,
      currency: 'COP',
      customerEmail: 'miguel@example.com',
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '40',
      cardHolderName: 'Miguel Suarez',
    });

    expect(mockedAxios.get).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(result.status).toBe('APPROVED');
    expect(result.wompiReference).toBe('wompi-tx-1');
  });

  it('returns ERROR when merchant acceptance token is missing', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { data: {} } });

    const adapter = new WompiHttpAdapter();

    const result = await adapter.charge({
      amountInCents: 1000,
      currency: 'COP',
      customerEmail: 'miguel@example.com',
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '40',
      cardHolderName: 'Miguel Suarez',
    });

    expect(result.status).toBe('ERROR');
    expect(result.wompiReference).toBe('');
  });

  it('returns ERROR when axios throws', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('network error'));

    const adapter = new WompiHttpAdapter();

    const result = await adapter.charge({
      amountInCents: 1000,
      currency: 'COP',
      customerEmail: 'miguel@example.com',
      cardNumber: '4111111111111111',
      cvc: '123',
      expMonth: '12',
      expYear: '40',
      cardHolderName: 'Miguel Suarez',
    });

    expect(result.status).toBe('ERROR');
    expect(result.wompiReference).toBe('');
  });
});
