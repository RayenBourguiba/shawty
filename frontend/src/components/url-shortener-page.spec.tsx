import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UrlShortenerPage } from './url-shortener-page';
import { api } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('UrlShortenerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state after loading', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [] });

    render(<UrlShortenerPage />);

    expect(await screen.findByText('No URLs created yet.')).toBeInTheDocument();
  });

  it('creates a short URL successfully', async () => {
    const user = userEvent.setup();

    (api.get as jest.Mock)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            id: '1',
            originalUrl: 'https://example.com',
            shortCode: 'abc1234',
            shortUrl: 'http://localhost:3001/abc1234',
            visitCount: 0,
            createdAt: new Date().toISOString(),
            lastVisitedAt: null,
          },
        ],
      });

    (api.post as jest.Mock).mockResolvedValue({
      data: {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc1234',
        shortUrl: 'http://localhost:3001/abc1234',
        visitCount: 0,
        createdAt: new Date().toISOString(),
        lastVisitedAt: null,
      },
    });

    render(<UrlShortenerPage />);

    const input = await screen.findByLabelText('Long URL');
    await user.type(input, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /create short url/i }));

    await waitFor(() => {
      expect(screen.getByText('Short URL created successfully')).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith('/api/urls', {
      url: 'https://example.com',
    });
  });

  it('shows an error when creation fails', async () => {
    const user = userEvent.setup();

    (api.get as jest.Mock).mockResolvedValue({ data: [] });
    (api.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: 'Please provide a valid http or https URL.',
        },
      },
    });

    render(<UrlShortenerPage />);

    const input = await screen.findByLabelText('Long URL');
    await user.type(input, 'https://example.com');
    await user.click(screen.getByRole('button', { name: /create short url/i }));

    expect(
      await screen.findByText('Please provide a valid http or https URL.'),
    ).toBeInTheDocument();

    expect(api.post).toHaveBeenCalledWith('/api/urls', {
      url: 'https://example.com',
    });
  });
});