import Link from 'next/link'

export default function UnifiedNavbar() {
	return (
		<nav className="flex items-center space-x-4">
			<Link href="/" className="text-gray-700 hover:text-gray-900">Home</Link>
			<Link href="/gallery" className="text-gray-700 hover:text-gray-900">Gallery</Link>
			<Link href="/admin" className="text-gray-700 hover:text-gray-900">Admin</Link>
		</nav>
	)
}
