import Link from 'next/link'

export default function FooterLanding() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">Promptly</div>
            <div className="text-xs text-gray-600 mt-1">Empowering creativity with AI</div>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <Link href="#" className="text-gray-600 hover:text-gray-900">About</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Contact</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Terms</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">Privacy</Link>
          </div>
        </div>
        <div className="mt-6 text-xs text-gray-500">© 2025 Promptly. All rights reserved.</div>
      </div>
    </footer>
  )
}


