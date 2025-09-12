import Link from 'next/link'

export default function CTABanner() {
  return (
    <section className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h3 className="text-xl sm:text-2xl font-semibold">Want to create and sell your own prompts?</h3>
        <p className="mt-2 text-gray-300">Join thousands of creators earning from their AI prompts</p>
        <Link href="#" className="inline-block mt-6 bg-white text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200">Get Started as Creator</Link>
      </div>
    </section>
  )
}


