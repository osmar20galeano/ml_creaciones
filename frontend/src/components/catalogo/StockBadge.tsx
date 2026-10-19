export function StockBadge({ stock }: { stock: number }) {
  const color = stock <= 0 ? 'bg-danger' : stock <= 3 ? 'bg-warning text-dark' : 'bg-success'
  return <span className={`badge ${color}`}>{stock}</span>
}
