/** Muestra texto con **negritas** marcadas con doble asterisco (formato de data/canvas.ts). */
export function TextoMarcado({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {partes.map((parte, i) =>
        parte.startsWith('**') && parte.endsWith('**') ? <strong key={i}>{parte.slice(2, -2)}</strong> : parte,
      )}
    </>
  )
}
