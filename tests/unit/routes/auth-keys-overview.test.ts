import { describe, expect, test, vi } from 'vitest';
import { loader } from '~/routes/settings/auth-keys/overview';

describe('Pre-auth key overview loader', () => {
	test('loads pre-auth keys for users without a username', async () => {
		const user = {
			id: 'user-id',
			name: '',
			createdAt: '2026-01-01T00:00:00.000Z',
			displayName: 'OIDC User',
			email: 'oidc@example.com',
		};

		const getPreAuthKeys = vi.fn().mockResolvedValue([
			{
				id: 'key-id',
				key: 'hskey-auth-123',
				user,
				reusable: false,
				ephemeral: false,
				used: false,
				expiration: '2026-02-01T00:00:00.000Z',
				createdAt: '2026-01-01T00:00:00.000Z',
				aclTags: [],
			},
		]);

		const args: Parameters<typeof loader>[0] = {
			request: new Request('http://localhost/admin/settings/auth-keys'),
			context: {
				sessions: {
					auth: vi.fn().mockResolvedValue({ api_key: 'test-key' }),
					check: vi.fn().mockResolvedValue(true),
				},
				hsApi: {
					getRuntimeClient: vi.fn().mockReturnValue({
						getUsers: vi.fn().mockResolvedValue([user]),
						getPreAuthKeys,
					}),
				},
				config: {
					headscale: {
						url: 'http://localhost:8080',
						public_url: null,
					},
				},
			},
		} as Parameters<typeof loader>[0];
		const result = await loader(args);

		expect(getPreAuthKeys).toHaveBeenCalledWith('user-id');
		expect(result.keys).toHaveLength(1);
		expect(result.missing).toHaveLength(0);
	});
});
