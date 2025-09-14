import Link from 'next/link'

export default function Header() {
	return (
		<header className="bg-white border-b">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
				<Link href="/" className="text-xl font-bold text-gray-900">Prompt Gallery</Link>
				<nav className="space-x-4">
					<Link href="/gallery" className="text-gray-600 hover:text-gray-900">Gallery</Link>
					<Link href="/admin" className="text-gray-600 hover:text-gray-900">Admin</Link>
					<Link href="/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
				</nav>
			</div>
		</header>
	)
}
