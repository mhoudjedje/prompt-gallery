export interface UserProfile {
	id: string
	email?: string
	full_name?: string
	avatar_url?: string
	subscription_status?: 'free' | 'premium' | string
	role?: string
}

export interface ConnectedAccount {
	provider: string
	connected: boolean
}

export interface NotificationSettings {
	newsletter_enabled?: boolean
}

export interface UserActivity {
	prompts_created?: number
	prompts_used?: number
}

export type ApiResponse<T> = { error?: { message?: string } | null; data?: T | null }

export const profileApi = {
	async getProfile(userId: string): Promise<ApiResponse<UserProfile>> {
		return { data: { id: userId, email: `${userId}@example.com`, full_name: 'User' } }
	},

	async updateProfile(userId: string, data: Record<string, unknown>): Promise<ApiResponse<UserProfile>> {
		const profile: UserProfile = {
			id: userId,
			full_name: typeof data.full_name === 'string' ? (data.full_name as string) : undefined,
			avatar_url: typeof data.avatar_url === 'string' ? (data.avatar_url as string) : undefined,
			email: typeof data.email === 'string' ? (data.email as string) : undefined,
			role: typeof data.role === 'string' ? (data.role as string) : undefined,
		}
		return { data: profile }
	},

	async getAllProfileData(userId: string): Promise<ApiResponse<{ profile: UserProfile; connectedAccounts: ConnectedAccount[]; notificationSettings: NotificationSettings | null; userActivity: UserActivity | null }>> {
		const profile: UserProfile = { id: userId, email: `${userId}@example.com`, full_name: 'User' }
		const connectedAccounts: ConnectedAccount[] = []
		const notificationSettings: NotificationSettings = { newsletter_enabled: true }
		const userActivity: UserActivity = { prompts_created: 0, prompts_used: 0 }
		return { data: { profile, connectedAccounts, notificationSettings, userActivity } }
	},

	async uploadAvatar(userId: string, file: File): Promise<ApiResponse<string>> {
		// Placeholder: return a fake URL
		return { data: `https://example.com/avatars/${userId}.png` }
	},

	async removeAvatar(userId: string): Promise<ApiResponse<null>> {
		return { data: null }
	},

	async updateConnectedAccount(userId: string, provider: string, connected: boolean): Promise<ApiResponse<ConnectedAccount>> {
		return { data: { provider, connected } }
	},

	async updatePassword(newPassword: string): Promise<ApiResponse<null>> {
		return { data: null }
	},

	async updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): Promise<ApiResponse<NotificationSettings>> {
		return { data: { ...settings } }
	},

	async deleteAccount(userId: string): Promise<ApiResponse<null>> {
		return { data: null }
	}
}

export type ProfileApi = typeof profileApi
