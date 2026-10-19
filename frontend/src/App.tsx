import { Navigate, Outlet, Route, Routes } from 'react-router'
import { RutaProtegida } from './components/auth/RutaProtegida'
import { Navbar } from './components/layout/Navbar'
import { useAuth } from './hooks/useAuth'
import { Admin } from './pages/Admin'
import { AdminProductos } from './pages/AdminProductos'
import { Bienvenida } from './pages/Bienvenida'
import { Login } from './pages/Login'
import { MisPedidos } from './pages/MisPedidos'
import { ModeloCanvas } from './pages/ModeloCanvas'
import { Recuperar } from './pages/Recuperar'
import { Registro } from './pages/Registro'
import { Tienda } from './pages/Tienda'
import { Verificar } from './pages/Verificar'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

/** Login y registro no tienen sentido si ya hay sesión abierta. */
function SoloInvitados() {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (usuario) return <Navigate to={usuario.rol === 'admin' ? '/admin' : '/'} replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      {/* Presentación del TP de Liderazgo: página completa, sin la barra de la tienda */}
      <Route path="canvas" element={<ModeloCanvas />} />
      <Route element={<Layout />}>
        <Route index element={<Tienda />} />
        <Route element={<SoloInvitados />}>
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="verificar" element={<Verificar />} />
          <Route path="recuperar" element={<Recuperar />} />
        </Route>
        <Route
          path="bienvenida"
          element={
            <RutaProtegida>
              <Bienvenida />
            </RutaProtegida>
          }
        />
        <Route
          path="mis-pedidos"
          element={
            <RutaProtegida rol="cliente">
              <MisPedidos />
            </RutaProtegida>
          }
        />
        <Route
          path="admin"
          element={
            <RutaProtegida rol="admin">
              <Admin />
            </RutaProtegida>
          }
        />
        <Route
          path="admin/productos"
          element={
            <RutaProtegida rol="admin">
              <AdminProductos />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
