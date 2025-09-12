import Link from 'next/link'

export default function HeaderLanding() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            Promptly
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="/gallery" className="text-gray-600 hover:text-gray-900">Browse</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Categories</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Creators</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
          <Link href="/signup" className="bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-black">Get Started</Link>
        </div>
      </div>
    </header>
  )
}


