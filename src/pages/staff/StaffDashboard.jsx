import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function StaffDashboard() {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusError, setStatusError] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const statusColors = {
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get('/requests')
      setRequests(res.data.content)
    } catch (err) {
      console.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (req) => {
    if (!selectedStatus) { setStatusError('Please select a status'); return }
    setStatusError('')
    try {
      await api.patch(`/requests/${req.id}/status`, { status: selectedStatus, departmentId: req.departmentId })
      setSuccess('Status updated successfully.')
      setUpdating(null)
      setSelectedStatus('')
      fetchRequests()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update status.')
      setTimeout(() => setError(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-900 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-white text-xl font-bold">GSRS</h1>
          <p className="text-blue-200 text-xs">Government Service Request System</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm">Staff: {user.name}</span>
          <button onClick={logout} className="bg-white text-blue-900 text-sm font-medium px-4 py-1.5 rounded hover:bg-blue-50 transition">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Department Requests</h2>
          <p className="text-gray-500 text-sm mt-1">Review and update the status of assigned requests</p>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">{error}</div>}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">No requests assigned.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Title</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Citizen</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Category</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Location</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Department</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 font-medium text-gray-800">{req.title}</td>
                    <td className="px-6 py-4 text-gray-600">{req.citizenName}</td>
                    <td className="px-6 py-4 text-gray-600">{req.category}</td>
                    <td className="px-6 py-4 text-gray-600">{req.location}</td>
                    <td className="px-6 py-4 text-gray-600">{req.departmentName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {updating === req.id ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedStatus}
                              onChange={(e) => { setSelectedStatus(e.target.value); setStatusError('') }}
                              className={`border rounded px-2 py-1 text-xs bg-white ${statusError ? 'border-red-400' : 'border-gray-300'}`}
                            >
                              <option value="">Select status</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                            <button onClick={() => handleUpdateStatus(req)} className="bg-blue-900 text-white text-xs px-2 py-1 rounded hover:bg-blue-800">Save</button>
                            <button onClick={() => { setUpdating(null); setStatusError('') }} className="text-gray-500 text-xs px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
                          </div>
                          {statusError && <p className="text-red-500 text-xs">{statusError}</p>}
                        </div>
                      ) : (
                        <button onClick={() => { setUpdating(req.id); setSelectedStatus(''); setStatusError('') }} className="text-blue-700 hover:underline text-xs font-medium">
                          Update Status
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