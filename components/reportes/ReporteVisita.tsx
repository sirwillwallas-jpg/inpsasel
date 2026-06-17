import React from 'react'

interface VisitaReporte {
  codigo_visita: string
  fecha: string
  hora: string
  tipo_visita: string
  estatus: string
  cordinacion_referida?: string | null
  observaciones?: string | null
  motivo_visita?: string | null
  sexo?: string | null
  edad?: number | null
  municipio?: string | null
  sector?: string | null
  cargo?: string | null
  funcion?: string | null
  actividad_economica?: string | null
  funcionario?: string | null
  id_contacto?: number | null
  id_orden?: number | null
}

function fmtFecha(iso: string) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio',
                 'julio','agosto','septiembre','octubre','noviembre','diciembre']
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} de ${meses[m - 1]}, ${y}`
}

function fmtHora(h: string) {
  const [hh, mm] = h.split(':').map(Number)
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const hh12 = hh % 12 || 12
  return `${String(hh12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`
}

export function ReporteVisita({ v }: { v: VisitaReporte }) {
  return (
    <div
      className="reporte-pagina bg-white mx-auto"
      style={{
        width: '210mm',
        padding: '14mm 18mm',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: '10.5pt',
        color: '#111',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Encabezado ───────────────────────────────────────── */}
      <div style={{
        borderBottom: '3px solid #1a2744',
        paddingBottom: '10px',
        marginBottom: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
      }}>
        {/* Texto izquierda */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15pt', fontWeight: 'bold', color: '#1a2744', letterSpacing: '0.3px' }}>
            REPORTE OFICIAL DE VISITA
          </div>
          <div style={{ fontSize: '8pt', color: '#555', marginTop: '2px' }}>
            Sistema de Registro de Visitas — INPSASEL GENESAT Portuguesa
          </div>
          <div style={{ marginTop: '6px', fontSize: '8.5pt' }}>
            <span style={{ color: '#666' }}>Código: </span>
            <strong style={{ color: '#1a2744' }}>{v.codigo_visita}</strong>
            {v.id_orden && (
              <span style={{ marginLeft: '16px', color: '#666' }}>
                OT: <strong style={{ color: '#1a2744' }}>OT-{v.id_orden}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Logo derecha */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://tse3.mm.bing.net/th/id/OIP.EM3DltdiNLHzZh23cV-MYQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="INPSASEL"
          style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      </div>

      {/* ── Datos de la visita ───────────────────────────────── */}
      <Seccion titulo="DATOS DE LA VISITA">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
          <Campo label="FECHA"            valor={fmtFecha(v.fecha)} />
          <Campo label="HORA DE INGRESO"  valor={fmtHora(v.hora)} />
          <Campo label="TIPO DE VISITA"   valor={v.tipo_visita} />
          <Campo label="ESTATUS"          valor={v.estatus} />
          {v.cordinacion_referida && (
            <Campo label="COORDINACIÓN REFERIDA" valor={v.cordinacion_referida} />
          )}
        </div>
      </Seccion>

      {/* ── Datos del visitante ──────────────────────────────── */}
      <Seccion titulo="DATOS DEL VISITANTE">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
          {v.funcionario   && <Campo label="NOMBRE COMPLETO" valor={v.funcionario} />}
          {v.id_contacto   && <Campo label="CÉDULA / RIF"    valor={`V-${v.id_contacto}`} />}
          {v.edad          && <Campo label="EDAD"            valor={`${v.edad} años`} />}
          {v.sexo          && <Campo label="SEXO"            valor={v.sexo} />}
          {v.municipio     && <Campo label="MUNICIPIO"       valor={v.municipio} />}
          {v.sector        && <Campo label="SECTOR"          valor={v.sector} />}
          {v.cargo         && <Campo label="CARGO"           valor={v.cargo} />}
          {v.funcion       && <Campo label="FUNCIÓN"         valor={v.funcion} />}
          {v.actividad_economica && (
            <Campo label="ACTIVIDAD ECONÓMICA" valor={v.actividad_economica} />
          )}
        </div>
        {v.motivo_visita && (
          <div style={{ marginTop: '6px' }}>
            <Campo label="MOTIVO DE VISITA" valor={v.motivo_visita} full />
          </div>
        )}
      </Seccion>

      {/* ── Observaciones ────────────────────────────────────── */}
      {v.observaciones && (
        <Seccion titulo="OBSERVACIONES">
          <p style={{ margin: 0, lineHeight: '1.55' }}>{v.observaciones}</p>
        </Seccion>
      )}

    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        background: '#1a2744', color: '#fff', fontWeight: 'bold',
        fontSize: '8.5pt', padding: '3px 10px', marginBottom: '7px',
        letterSpacing: '0.8px',
      }}>
        {titulo}
      </div>
      {children}
    </div>
  )
}

function Campo({ label, valor, full }: { label: string; valor: string; full?: boolean }) {
  return (
    <div style={{ gridColumn: full ? '1/-1' : undefined }}>
      <span style={{ fontSize: '7pt', color: '#666', fontWeight: 'bold', letterSpacing: '0.4px' }}>
        {label}:{' '}
      </span>
      <span style={{ fontSize: '10pt' }}>{valor}</span>
    </div>
  )
}
