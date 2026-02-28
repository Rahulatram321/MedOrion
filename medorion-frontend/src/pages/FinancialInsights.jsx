import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import CostImpactTable from '../components/CostImpactTable'
import { getCostImpact } from '../services/api'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

function FinancialInsights({ refreshToken, onRefreshStateChange }) {
  const [costs, setCosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCostImpact = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true)
      }
      setError('')
      onRefreshStateChange(true)

      try {
        const response = await getCostImpact()
        setCosts(Array.isArray(response) ? response : [])
      } catch (requestError) {
        setError(requestError.message || 'Unable to fetch cost impact data.')
      } finally {
        setLoading(false)
        onRefreshStateChange(false)
      }
    },
    [onRefreshStateChange],
  )

  useEffect(() => {
    loadCostImpact()
  }, [loadCostImpact])

  useEffect(() => {
    if (!refreshToken) {
      return
    }
    loadCostImpact(true)
  }, [refreshToken, loadCostImpact])

  useEffect(
    () => () => {
      onRefreshStateChange(false)
    },
    [onRefreshStateChange],
  )

  const totalDelayCost = useMemo(
    () => costs.reduce((running, item) => running + (Number(item?.delayCost) || 0), 0),
    [costs],
  )

  const projectedMonthlyLoss = totalDelayCost * 30

  const highestCostDepartment = useMemo(() => {
    if (!costs.length) {
      return null
    }
    return [...costs].sort((left, right) => (right?.delayCost ?? 0) - (left?.delayCost ?? 0))[0]
  }, [costs])

  const chartData = useMemo(
    () =>
      costs.map((item) => ({
        department: item?.departmentName || 'Unknown',
        delayCost: Number(item?.delayCost) || 0,
      })),
    [costs],
  )

  return (
    <section className="space-y-4">
      <div>
        <h1 className="metric-title text-2xl font-bold text-black">Financial Insights</h1>
        <p className="text-sm text-gray-500">
          Delay-cost analytics and projected impact across hospital departments.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="glass-card rounded-xl p-5 lg:col-span-2">
          <p className="text-sm text-gray-500">Total Delay Cost (Daily)</p>
          {loading ? (
            <div className="mt-2 h-10 w-56 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="metric-title mt-2 text-4xl font-bold text-black">
              {formatCurrency(totalDelayCost)}
            </p>
          )}
        </article>

        <article className="glass-card rounded-xl p-5">
          <p className="text-sm text-gray-500">Projected Monthly Loss</p>
          {loading ? (
            <div className="mt-2 h-10 w-44 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="metric-title mt-2 text-3xl font-bold text-black">
              {formatCurrency(projectedMonthlyLoss)}
            </p>
          )}
        </article>
      </div>

      <section className="glass-card rounded-xl p-5">
        <h2 className="metric-title text-lg font-semibold text-black">Delay Cost Comparison</h2>
        <p className="text-sm text-gray-500">Department-wise delay cost bar chart.</p>

        <div className="mt-4 h-72 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          {loading ? (
            <div className="h-full animate-pulse rounded-xl bg-gray-100" />
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No cost impact data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
                <XAxis dataKey="department" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#e5e7eb',
                    backgroundColor: '#ffffff',
                  }}
                />
                <Bar dataKey="delayCost" fill="#111827" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="glass-card rounded-xl p-5">
        <h2 className="metric-title text-lg font-semibold text-black">Highest Cost Department</h2>
        {!loading && highestCostDepartment ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500">{highestCostDepartment.departmentName}</p>
            <p className="metric-title mt-1 text-2xl font-bold text-black">
              {formatCurrency(highestCostDepartment.delayCost)}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Avg wait {(Number(highestCostDepartment.avgWaitTime) || 0).toFixed(2)} mins
            </p>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
            {loading ? 'Calculating highest cost department...' : 'No data available.'}
          </div>
        )}
      </section>

      <CostImpactTable costs={costs} loading={loading} />
    </section>
  )
}

FinancialInsights.defaultProps = {
  onRefreshStateChange: () => {},
  refreshToken: 0,
}

export default FinancialInsights
