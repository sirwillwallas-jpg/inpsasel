'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logoutAction } from '@/actions/auth'
import { userCanManageVisits } from '@/lib/auth/permissions'

interface SidebarProps {
  roleName: string
}

const NAV = {
  VISITA: [
    { href: '/visitas/registrar', label: 'Registrar' },
    { href: '/visitas/modificar', label: 'Modificar', adminOnly: true },
    { href: '/visitas/eliminar',  label: 'Eliminar',  adminOnly: true },
  ],
  REPORTES: [
    { href: '/visitas/hoy',        label: 'Visitas del día' },
    { href: '/visitas/calendario', label: 'Calendario de visitas' },
  ],
}

export function Sidebar({ roleName }: SidebarProps) {
  const pathname  = usePathname()
  const canManage = userCanManageVisits(roleName)

  const [abierto, setAbierto] = useState(false)

  // Cierra el menú móvil al navegar
  useEffect(() => { setAbierto(false) }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
    {/* Barra superior — solo móvil */}
    <header
      className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 no-print"
      style={{ background: '#1a2744' }}
    >
      <p className="text-white text-sm font-semibold truncate">INPSASEL · Registro de Visitas</p>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        aria-expanded={abierto}
        className="text-white text-2xl leading-none px-2 py-1 rounded hover:bg-white/10"
      >
        ☰
      </button>
    </header>

    {/* Fondo oscuro del menú móvil */}
    {abierto && (
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/50"
        onClick={() => setAbierto(false)}
        aria-hidden="true"
      />
    )}

    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] flex flex-col overflow-y-auto transition-transform duration-200
        md:sticky md:top-0 md:h-screen md:translate-x-0 md:shrink-0
        ${abierto ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ background: '#1a2744' }}
    >
      {/* Cerrar — solo móvil */}
      <button
        type="button"
        onClick={() => setAbierto(false)}
        aria-label="Cerrar menú"
        className="md:hidden absolute top-3 right-3 text-white/70 hover:text-white text-2xl leading-none"
      >
        ×
      </button>
      {/* Logo + título */}
      <div className="flex flex-col items-center px-6 pt-8 pb-6 border-b border-white/10">
        <Image
          src="https://tse3.mm.bing.net/th/id/OIP.EM3DltdiNLHzZh23cV-MYQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="Logo INPSASEL"
          width={80}
          height={80}
          className="rounded-full object-contain mb-4"
          unoptimized
        />
        <p className="text-white text-sm font-semibold text-center leading-snug">
          Sistema de Registro de Visitas de<br />
          INPSASEL GENESAT Portuguesa
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4">
        {/* Sección VISITA */}
        <div className="mb-2">
          <p className="px-6 py-2 text-xs font-semibold tracking-widest text-blue-300/70 uppercase">
            Visita
          </p>
          {NAV.VISITA.filter(l => !l.adminOnly || canManage).map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} active={isActive(href)} />
          ))}
        </div>

        {/* Sección REPORTES */}
        <div className="mt-4">
          <p className="px-6 py-2 text-xs font-semibold tracking-widest text-blue-300/70 uppercase">
            Reportes
          </p>
          {NAV.REPORTES.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} active={isActive(href)} />
          ))}
        </div>
      </nav>

      {/* Cerrar sesión */}
      <div className="px-4 pb-6 pt-2 border-t border-white/10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ background: '#0f1c36' }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
    </>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`block w-full px-6 py-2.5 text-sm font-semibold text-center transition-all duration-150 ${
        active
          ? 'bg-white/15 text-white'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )
}
