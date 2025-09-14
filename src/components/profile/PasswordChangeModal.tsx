import React from 'react'

interface Props {
	isOpen: boolean
	onClose: () => void
	onConfirm: (newPassword: string) => void
	isLoading?: boolean
}

export default function PasswordChangeModal({ isOpen, onClose, onConfirm, isLoading }: Props) {
	if (!isOpen) return null

	const [value, setValue] = React.useState('')

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/40">
			<div className="bg-white rounded p-6 w-full max-w-md">
				<h3 className="text-lg font-medium mb-4">Change Password</h3>
				<input
					type="password"
					className="w-full border p-2 mb-4"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				<div className="flex justify-end gap-2">
					<button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
					<button
						onClick={() => onConfirm(value)}
						disabled={isLoading}
						className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
					>
						{isLoading ? 'Saving...' : 'Save'}
					</button>
				</div>
			</div>
		</div>
	)
}
