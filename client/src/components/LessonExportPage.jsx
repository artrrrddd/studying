import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LessonService from '../services/LessonService'

const pageStyle = {
  minHeight: '100vh',
  padding: '48px',
  color: '#0f172a',
  background: '#f8fafc',
}

const frameStyle = {
  width: '1200px',
  margin: '0 auto',
  padding: '40px',
  borderRadius: '32px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
  boxShadow: '0 24px 80px rgba(15, 23, 42, 0.14)',
}

const headerStyle = {
  marginBottom: '32px',
  paddingBottom: '24px',
  borderBottom: '1px solid #dbe4f0',
}

const titleStyle = {
  margin: 0,
  fontSize: '44px',
  lineHeight: 1.1,
}

const descriptionStyle = {
  margin: '12px 0 0',
  fontSize: '18px',
  color: '#475569',
}

const metaStyle = {
  marginTop: '16px',
  fontSize: '14px',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '20px',
}

const cardStyle = {
  padding: '24px',
  borderRadius: '20px',
  border: '1px solid #dbe4f0',
  background: '#ffffff',
}

const labelStyle = {
  margin: 0,
  fontSize: '13px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

const valueStyle = {
  margin: '10px 0 0',
  fontSize: '28px',
  fontWeight: 700,
  color: '#0f172a',
  wordBreak: 'break-word',
}

const emptyStyle = {
  padding: '60px 32px',
  textAlign: 'center',
  color: '#475569',
  fontSize: '18px',
}

function LessonExportPage() {
  const { id } = useParams()
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    window.__EXPORT_READY__ = false
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadLesson() {
      try {
        const data = await LessonService.getById(id)
        if (cancelled) {
          return
        }

        setLesson(data)

        requestAnimationFrame(() => {
          if (cancelled) {
            return
          }

          const root = document.querySelector('[data-export-root]')
          if (root) {
            root.setAttribute('data-export-ready', 'true')
          }
          window.__EXPORT_READY__ = true
        })
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setError(loadError?.response?.data?.message || 'Failed to load lesson')
        requestAnimationFrame(() => {
          if (cancelled) {
            return
          }

          const root = document.querySelector('[data-export-root]')
          if (root) {
            root.setAttribute('data-export-ready', 'true')
          }
          window.__EXPORT_READY__ = true
        })
      }
    }

    loadLesson()

    return () => {
      cancelled = true
      window.__EXPORT_READY__ = false
    }
  }, [id])

  return (
    <main style={pageStyle}>
      <section
        data-export-root
        data-export-ready="false"
        style={frameStyle}
      >
        {!lesson && !error && <div style={emptyStyle}>Loading export...</div>}

        {error && <div style={emptyStyle}>{error}</div>}

        {lesson && (
          <>
            <header style={headerStyle}>
              <h1 style={titleStyle}>{lesson.title}</h1>
              <p style={descriptionStyle}>
                {lesson.description || 'Lesson export'}
              </p>
              <div style={metaStyle}>
                {lesson.cards?.length || 0} cards
              </div>
            </header>

            <div style={gridStyle}>
              {lesson.cards?.map((card, index) => (
                <article key={card.id || `${card.word}-${index}`} style={cardStyle}>
                  <p style={labelStyle}>Term {index + 1}</p>
                  <p style={valueStyle}>{card.word}</p>
                  <p style={{ ...labelStyle, marginTop: '18px' }}>Definition</p>
                  <p style={{ ...valueStyle, fontSize: '22px', fontWeight: 600 }}>
                    {card.translate}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default LessonExportPage
