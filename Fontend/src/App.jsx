import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Card from './components/Card/Card'
import EmptyState from './components/EmptyState/EmptyState'
import FilterBar from './components/FilterBar/FilterBar'
import HeroSearch from './components/HeroSearch/HeroSearch'
import InternshipModal from './components/InternshipModal/InternshipModal'
import internships from './data/internships.json'
import { useMemo, useState } from 'react'

function App() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Tất cả địa điểm')
  const [sortBy, setSortBy] = useState('Mới nhất')
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [savedIds, setSavedIds] = useState([])

  const locations = ['Tất cả địa điểm', ...new Set(internships.map((internship) => internship.location))]

  const filteredInternships = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const result = internships.filter((internship) => {
      const searchableText = [internship.company, internship.position, internship.location, ...internship.tags]
        .join(' ')
        .toLowerCase()

      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (location === 'Tất cả địa điểm' || internship.location === location)
      )
    })

    if (sortBy === 'A-Z') {
      return [...result].sort((first, second) => first.company.localeCompare(second.company))
    }

    return result
  }, [location, query, sortBy])

  const toggleSaved = (id) => {
    setSavedIds((currentIds) =>
      currentIds.includes(id) ? currentIds.filter((savedId) => savedId !== id) : [...currentIds, id],
    )
  }

  return (
    <div className="min-h-screen bg-[#f7faff] text-[#172d50]">
      <Header />
      <main>
        <HeroSearch query={query} onQueryChange={setQuery} />
        <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-9" id="co-hoi-thuc-tap">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0a66c2]">Khám phá cơ hội</p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#172d50]">Cơ hội thực tập nổi bật</h1>
              <p className="mt-1 text-sm text-[#6d819d]">Tìm vị trí phù hợp với kỹ năng và định hướng của bạn.</p>
            </div>
            <span className="text-xs font-semibold text-[#6d819d]">{filteredInternships.length} cơ hội đang hiển thị</span>
          </div>

          <FilterBar
            locations={locations}
            location={location}
            sortBy={sortBy}
            onLocationChange={setLocation}
            onSortChange={setSortBy}
          />

          {filteredInternships.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {filteredInternships.map((internship) => (
                <Card
                  key={internship.id}
                  {...internship}
                  isSaved={savedIds.includes(internship.id)}
                  onDetailClick={() => setSelectedInternship(internship)}
                  onSave={() => toggleSaved(internship.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState onReset={() => { setQuery(''); setLocation('Tất cả địa điểm') }} />
          )}
        </section>
      </main>
      <Footer />
      {selectedInternship && (
        <InternshipModal internship={selectedInternship} onClose={() => setSelectedInternship(null)} />
      )}
    </div>
  )
}

export default App
