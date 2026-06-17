import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ codigo?: string }>
}

// El reporte individual ahora se accede desde el wizard del calendario.
// Si alguien entra directo por URL, vuelve al calendario.
export default async function ReportePage({ searchParams }: PageProps) {
  const { codigo } = await searchParams
  redirect(codigo ? `/visitas/calendario` : '/visitas/calendario')
}
