import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export type Collection = {
  id: string
  name: string
  description?: string | null
}

export type Prompt = {
  id: string
  title: string
  description: string | null
  result_url: string | null
  category_id: string | null
  collection_name?: string | null
}

export async function getCollections(): Promise<Collection[]> {
  if (!isSupabaseConfigured()) {
    console.log('[getCollections] Supabase not configured, returning empty array')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, description')
      .limit(4)

    if (error) {
      console.error('[getCollections] error:', error)
      return []
    }

    console.log('[getCollections] rows:', data?.length)
    return data ?? []
  } catch (err) {
    console.error('[getCollections] exception:', err)
    return []
  }
}

export async function getTrendingPrompts(limit = 8): Promise<Prompt[]> {
  if (!isSupabaseConfigured()) {
    console.log('[getTrendingPrompts] Supabase not configured, returning empty array')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('id, title, description, result_url, category_id, collections(name)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[getTrendingPrompts] error:', error)
      return []
    }

    const mapped: Prompt[] = (data ?? []).map((row: {
      id: string
      title: string
      description: string | null
      result_url: string | null
      category_id: string | null
      collections?: { name?: string | null } | null
    }) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      result_url: row.result_url,
      category_id: row.category_id,
      collection_name: row.collections?.name ?? null,
    }))

    console.log('[getTrendingPrompts] rows:', mapped.length)
    return mapped
  } catch (err) {
    console.error('[getTrendingPrompts] exception:', err)
    return []
  }
}

export async function searchPrompts(query: string): Promise<Prompt[]> {
  if (!isSupabaseConfigured()) {
    console.log('[searchPrompts] Supabase not configured, returning empty array')
    return []
  }

  try {
    const trimmed = query?.trim() ?? ''
    if (!trimmed) return []

    console.debug('[searchPrompts] query:', trimmed)

    const { data, error } = await supabase
      .from('prompts')
      .select('id, title, description, result_url, category_id, collections(name)')
      .textSearch('search_vector', trimmed, { type: 'websearch' })
      .limit(24)

    if (error) {
      console.error('[searchPrompts] error:', error)
      return []
    }

    const rows = data ?? []
    const mapped: Prompt[] = rows.map((row: {
      id: string
      title: string
      description: string | null
      result_url: string | null
      category_id: string | null
      collections?: { name?: string | null } | null
    }) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      result_url: row.result_url,
      category_id: row.category_id,
      collection_name: row.collections?.name ?? null,
    }))

    console.debug('[searchPrompts] results:', mapped.length)
    return mapped
  } catch (err) {
    console.error('[searchPrompts] exception:', err)
    return []
  }
}


