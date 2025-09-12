type CollectionCardProps = {
  icon: string
  title: string
  description: string
}

function CollectionCard({ icon, title, description }: CollectionCardProps) {
  return (
    <div className="border rounded-lg p-6 text-center bg-white hover:shadow-sm transition">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getCollections, type Collection } from '@/lib/queries'

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    getCollections().then((rows) => setCollections(rows))
  }, [])

  const items: CollectionCardProps[] = collections.length > 0
    ? collections.map((c) => ({ icon: '⭐', title: c.name, description: c.description || '' }))
    : [
        { icon: '🎨', title: 'Design', description: 'Prompts for graphics, UI, branding' },
        { icon: '📷', title: 'Photography', description: 'Prompts to generate photo concepts' },
        { icon: '💼', title: 'Business', description: 'Prompts for marketing, copy, and growth' },
        { icon: '⭐', title: 'Art & Fun', description: 'Creative ideas for fun projects' },
      ]

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-center text-lg font-semibold text-gray-900">Explore Collections</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <CollectionCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}


