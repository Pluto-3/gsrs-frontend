import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', departmentId: '', category: '' })
  const [assigning, setAssigning] = useState(null)
  const [assignDeptId, setAssignDeptId] = useState('')
  const [success, setSuccess] = useState('')

  const statusColors = {
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  useEffect(() => {
    fetchDepartments()
    fetchStats()
    fetchRequests()
  }, [])

  const fetchRequests = async (f = filters) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (f.status) params.append('status', f.status)
        if (f.departmentId) params.append('departmentId', f.departmentId)
        if (f.category) params.append('category', f.category)
        const res = await api.get(`/admin/requests?${params.toString()}`)
        setRequests(res.data.content)
      } catch (err) {
        console.error('Failed to fetch requests')
      } finally {
        setLoading(false)
      }
    }

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/requests/stats')
      setStats(res.data)
    } catch (err) {
      console.error('Failed to fetch stats')
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments')
      setDepartments(res.data)
    } catch (err) {
      console.error('Failed to fetch departments')
    }
  }

  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value }
    setFilters(updated)
    fetchRequests(updated)
  }

  const handleAssign = async (requestId) => {
    try {
      await api.put(`/admin/requests/${requestId}/assign`, { departmentId: assignDeptId })
      setSuccess('Request assigned successfully.')
      setAssigning(null)
      setAssignDeptId('')
      fetchRequests()
      fetchStats()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to assign')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-900 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl font-bold">GSRS</h1>
          <p className="text-blue-200 text-xs">Government Service Request System</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm">Admin: {user.name}</span>
          <button
            onClick={logout}
            className="bg-white text-blue-900 text-sm font-medium px-4 py-1.5 rounded hover:bg-blue-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'bg-gray-800' },
              { label: 'Submitted', value: stats.submitted, color: 'bg-yellow-500' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-600' },
              { label: 'Resolved', value: stats.resolved, color: 'bg-green-600' },
              { label: 'Rejected', value: stats.rejected, color: 'bg-red-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                <div className={`text-white text-2xl font-bold rounded-lg py-2 mb-2 ${s.color}`}>
                  {s.value}
                </div>
                <p className="text-gray-600 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Department</label>
              <select
                name="departmentId"
                value={filters.departmentId}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="e.g. Infrastructure"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">No requests found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Title</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Citizen</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Category</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Department</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 font-medium text-gray-800">{req.title}</td>
                    <td className="px-6 py-4 text-gray-600">{req.citizenName}</td>
                    <td className="px-6 py-4 text-gray-600">{req.category}</td>
                    <td className="px-6 py-4 text-gray-600">{req.departmentName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {assigning === req.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={assignDeptId}
                            onChange={(e) => setAssignDeptId(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-xs bg-white"
                          >
                            <option value="">Select</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(req.id)}
                            className="bg-blue-900 text-white text-xs px-2 py-1 rounded hover:bg-blue-800"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setAssigning(null)}
                            className="text-gray-500 text-xs px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAssigning(req.id); setAssignDeptId('') }}
                          className="text-blue-700 hover:underline text-xs font-medium"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}