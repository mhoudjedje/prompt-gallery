export default function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900">
          Discover & Create Stunning Prompts
        </h1>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          A curated library of AI prompts to inspire your next project.
        </p>

        <div className="mt-8">
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search prompts, categories, or creators..."
              className="w-full border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="mt-3 text-xs text-gray-500">
            <span className="mr-2">Popular:</span>
            <span className="mr-3 hover:text-gray-900 cursor-pointer">Logo Design</span>
            <span className="mr-3 hover:text-gray-900 cursor-pointer">Photography</span>
            <span className="hover:text-gray-900 cursor-pointer">Marketing Copy</span>
          </div>
        </div>
      </div>
    </section>
  )
}


