import { useState } from 'react'

interface Props {
  id: string
  label: string
  value: string
  onChange: (valor: string) => void
  autoComplete: 'current-password' | 'new-password'
  invalido?: boolean
}

export function CampoPassword({ id, label, value, onChange, autoComplete, invalido }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-group">
        <span className="input-group-text auth-icono"><i className="bi bi-lock-fill" /></span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`form-control auth-input ${invalido ? 'is-invalid' : ''}`}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} />
        </button>
      </div>
    </div>
  )
}
