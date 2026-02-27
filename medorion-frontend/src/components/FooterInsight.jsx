const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value || 0)

function FooterInsight({ summary, stress }) {
  const topStress = [...stress].sort(
    (a, b) => (b.stressScore ?? 0) - (a.stressScore ?? 0),
  )[0]

  const message = topStress
    ? `${topStress.departmentName} operating at ${(topStress.stressScore ?? 0).toFixed(
        1,
      )}x capacity. Estimated daily delay cost exceeds ${formatCurrency(summary?.totalDelayCost)}.`
    : 'Awaiting operational signals from MedOrion analytics backend.'

  return (
    <footer className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-800 shadow-sm">
      <p className="metric-title text-lg font-semibold text-gray-900">Executive Insight</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">{message}</p>
    </footer>
  )
}

export default FooterInsight
