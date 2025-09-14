export interface UserProfile {
	id: string
	display_name?: string
	bio?: string
}

export const profileApi = {
	async getProfile(userId: string): Promise<UserProfile> {
		// Minimal placeholder — implement actual Supabase calls here
		return { id: userId, display_name: 'User', bio: '' }
	},
		async updateProfile(userId: string, data: Record<string, unknown>): Promise<UserProfile> {
			// Minimal placeholder — implement actual update logic
			const profile: UserProfile = {
				id: userId,
				display_name: typeof data.display_name === 'string' ? (data.display_name as string) : undefined,
				bio: typeof data.bio === 'string' ? (data.bio as string) : undefined,
			}
			return profile
		}
}

export type ProfileApi = typeof profileApi
