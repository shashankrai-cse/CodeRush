import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';
import { DEPARTMENTS } from '../../constants.js';

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering state
  const [filterDept, setFilterDept] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');

  // Editing state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: '', department: '', enrollmentYear: '', section: '', rollNumber: '' });

  // Bulk Promote state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({ targetDepartment: '', targetYear: '', targetSection: '', newYear: '', newSection: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      alert('User deleted');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  }

  function startEdit(usr) {
    setEditingUser(usr);
    setEditForm({
      fullName: usr.fullName || '',
      department: usr.department || '',
      enrollmentYear: usr.enrollmentYear || '',
      section: usr.section || '',
      rollNumber: usr.rollNumber || ''
    });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser._id}`, editForm);
      alert('User updated');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  }

  async function handleBulkPromoteSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        targetDepartment: bulkForm.targetDepartment,
        targetYear: bulkForm.targetYear ? Number(bulkForm.targetYear) : null
      };
      if (bulkForm.targetSection) payload.targetSection = bulkForm.targetSection;
      if (bulkForm.newYear) payload.newYear = Number(bulkForm.newYear);
      if (bulkForm.newSection) payload.newSection = bulkForm.newSection;

      const { data } = await api.post('/users/bulk-promote', payload);
      alert(data.message);
      setShowBulkModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to run bulk action');
    }
  }

  const filteredUsers = users.filter(u => {
    if (filterDept && u.department !== filterDept) return false;
    if (filterYear && String(u.enrollmentYear) !== filterYear) return false;
    if (filterSection && u.section !== filterSection) return false;
    return true;
  });

  return (
    <div className="mod-container animate-fade-in">
      <div className="mod-hero flex justify-between items-center pr-6">
        <div>
          <h2 className="mod-title flex gap-2 items-center">
            <span>👥</span> Directory Management
          </h2>
          <p className="mod-subtitle">View and manage users, update records, and maintain the campus roster.</p>
        </div>
        <div>
          <button className="btn-primary" onClick={() => setShowBulkModal(true)}>
            ⚡ Bulk Promote Section
          </button>
        </div>
      </div>

      <div className="mod-card mb-6" style={{ display: 'flex', gap: '1rem' }}>
        <select className="mod-input" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{flex: 1}}>
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <input type="number" placeholder="Filter Year (e.g. 1)" className="mod-input" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{flex: 1}} />
        <input placeholder="Filter Section (e.g. A)" className="mod-input" value={filterSection} onChange={e => setFilterSection(e.target.value)} style={{flex: 1}} />
        <button className="btn-outline" onClick={() => { setFilterDept(''); setFilterYear(''); setFilterSection(''); }}>Clear Filters</button>
      </div>

      {loading ? (
        <div className="mod-spinner-wrap"><div className="mod-spinner"/></div>
      ) : (
        <div className="mod-card">
          <div className="mod-table-wrap">
            <table className="mod-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td className="font-medium text-ink-900">{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        u.role === 'teacher' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-sm text-ink-500">
                      {u.role === 'student' ? (
                        <>Dept: {u.department} | Yr: {u.enrollmentYear} | Sec: {u.section || 'N/A'}</>
                      ) : (
                        <>Dept: {u.department || 'All'} | {u.campus?.name}</>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="text-sm text-blue-600 hover:underline" onClick={() => startEdit(u)}>Edit</button>
                        <button className="text-sm text-red-600 hover:underline" onClick={() => handleDelete(u._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="dash-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="mod-card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 className="text-lg font-medium mb-4">Edit User Profile</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input required className="mod-input" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} />
              </div>
              
              {editingUser.role === 'student' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <select className="mod-input" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year</label>
                    <input type="number" min="1" className="mod-input" value={editForm.enrollmentYear} onChange={e => setEditForm({...editForm, enrollmentYear: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Section</label>
                    <input className="mod-input" value={editForm.section} onChange={e => setEditForm({...editForm, section: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Roll Number</label>
                    <input className="mod-input" value={editForm.rollNumber} onChange={e => setEditForm({...editForm, rollNumber: e.target.value})} />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Promote Modal */}
      {showBulkModal && (
        <div className="dash-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="mod-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 className="text-lg font-medium mb-4">⚡ Bulk Promote Section</h3>
            <p className="text-sm text-ink-500 mb-6">Select a target demographic of students and instantly upgrade their year or re-assign their section globally.</p>
            
            <form onSubmit={handleBulkPromoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                   <label className="text-sm font-medium text-red-600 block mb-1">Target Department *</label>
                   <select required className="mod-input" value={bulkForm.targetDepartment} onChange={e => setBulkForm({...bulkForm, targetDepartment: e.target.value})}>
                     <option value="">Select Target...</option>
                     {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                 </div>
                 <div style={{ flex: 1 }}>
                   <label className="text-sm font-medium text-red-600 block mb-1">Target Year *</label>
                   <input required type="number" min="1" className="mod-input" placeholder="e.g. 1" value={bulkForm.targetYear} onChange={e => setBulkForm({...bulkForm, targetYear: e.target.value})} />
                 </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Target Section (Optional)</label>
                <input className="mod-input" placeholder="Limit to specific section (e.g. A)" value={bulkForm.targetSection} onChange={e => setBulkForm({...bulkForm, targetSection: e.target.value})} />
              </div>

              <hr className="my-2" />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                   <label className="text-sm font-medium block mb-1">New Year (Optional)</label>
                   <input type="number" min="1" className="mod-input" placeholder="Leave blank to skip" value={bulkForm.newYear} onChange={e => setBulkForm({...bulkForm, newYear: e.target.value})} />
                 </div>
                 <div style={{ flex: 1 }}>
                   <label className="text-sm font-medium block mb-1">New Section (Optional)</label>
                   <input className="mod-input" placeholder="Leave blank to skip" value={bulkForm.newSection} onChange={e => setBulkForm({...bulkForm, newSection: e.target.value})} />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn-outline" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Execute Bulk Action</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
