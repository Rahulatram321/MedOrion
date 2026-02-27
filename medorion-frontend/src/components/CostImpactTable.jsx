const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)

function CostImpactTable({ costs, loading }) {
  return (
    <section className="glass-card rounded-2xl p-5 md:p-6">
      <h2 className="metric-title text-lg font-semibold text-gray-900">Financial Impact Calculator</h2>
      <p className="text-xs text-gray-400">
        Delay cost estimates by department based on current wait trends.
      </p>

      <div className="thin-scrollbar mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase tracking-[0.15em] text-gray-500">
            <tr>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Patients</th>
              <th className="px-4 py-3">Avg Wait</th>
              <th className="px-4 py-3">Cost Factor</th>
              <th className="px-4 py-3">Delay Cost</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`cost-skeleton-${index}`} className="border-t border-gray-200">
                    {Array.from({ length: 6 }).map((__, colIndex) => (
                      <td key={`${index}-${colIndex}`} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              : costs.map((item, index) => (
                  <tr
                    key={`${item.departmentId}-${item.statsDate}`}
                    className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-3 font-medium">{item.departmentName}</td>
                    <td className="px-4 py-3">{item.statsDate}</td>
                    <td className="px-4 py-3">{item.totalPatients}</td>
                    <td className="px-4 py-3">{(item.avgWaitTime ?? 0).toFixed(2)} mins</td>
                    <td className="px-4 py-3">{(item.costFactor ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatCurrency(item.delayCost)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && costs.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No cost impact records found.</p>
        ) : null}
      </div>
    </section>
  )
}

export default CostImpactTable
