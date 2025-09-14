export const profileApi = {
	async getProfile(userId: string) {
		// Minimal placeholder — implement actual Supabase calls here
		return { id: userId, display_name: 'User', bio: '' }
	},
	async updateProfile(userId: string, data: Record<string, any>) {
		// Minimal placeholder — implement actual update logic
		return { ...data, id: userId }
	}
}

export type ProfileApi = typeof profileApi
