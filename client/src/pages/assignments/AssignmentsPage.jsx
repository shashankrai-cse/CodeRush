import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // For teachers
  const [showModal, setShowModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', subject: '', dueDate: '', 
    targetDepartment: '', targetYear: '', targetSection: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchAssignments();
    if (user.role === 'teacher' || user.role === 'admin') {
      fetchSubjects();
    }
  }, [user]);

  async function fetchAssignments() {
    try {
      const { data } = await api.get('/assignments');
      setAssignments(user.role === 'student' ? data.data.records : data.data.assignments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSubjects() {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.data.subjects);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append('file', file);

      await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      fetchAssignments();
      setForm({ title: '', description: '', subject: '', dueDate: '', targetDepartment: '', targetYear: '', targetSection: '' });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Failed to post assignment');
    }
  }

  async function handleGrade(recordId) {
    const marks = prompt('Enter marks for student:');
    if (marks === null) return;
    try {
      await api.put(`/assignments/records/${recordId}`, { marks: Number(marks) });
      alert('Graded successfully!');
    } catch (err) {
      console.error(err);
    }
  }

  async function downloadReport(assignmentId) {
    try {
      const response = await api.get(`/assignments/${assignmentId}/report/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assignment-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download report');
    }
  }

  return (
    <div className="mod-container animate-fade-in">
      <div className="mod-header">
        <div>
          <h2 className="mod-title">Assignments Hub</h2>
          <p className="mod-subtitle">
            {user.role === 'student' 
              ? 'Track deadlines and view your assignment grades'
              : 'Create assignments, track submissions, and generate reports'}
          </p>
        </div>
        {(user.role === 'teacher' || user.role === 'admin') && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Post Assignment
          </button>
        )}
      </div>

      {loading ? (
        <div className="mod-spinner-wrap"><div className="mod-spinner"/></div>
      ) : (
        <div className="grid gap-md">
          {user.role === 'student' ? (
            // Student View
            assignments.length === 0 ? (
              <div className="mod-card text-center p-md text-ink-500">No pending assignments!</div>
            ) : (
              assignments.map((record) => (
                <div key={record._id} className="mod-card">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{record.assignment.title}</h3>
                      <p className="text-sm text-ink-500 mt-1">{record.assignment.subject?.name}</p>
                      <p className="text-sm mt-1">{record.assignment.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${record.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {record.status.toUpperCase()}
                      </span>
                      {record.status === 'completed' && (
                        <div className="mt-2 font-bold text-accent">Marks: {record.marks}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4">
                    {record.assignment.pdfAttachment && (
                      <a href={`http://localhost:5000${record.assignment.pdfAttachment}`} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm font-medium">
                        View Assignment PDF
                      </a>
                    )}
                  </div>
                </div>
              ))
            )
          ) : (
            // Teacher View
            assignments.length === 0 ? (
              <div className="mod-card text-center p-md text-ink-500">No assignments created yet.</div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment._id} className="mod-card">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{assignment.title}</h3>
                      <p className="text-sm text-ink-500">{assignment.subject?.name} • Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </div>
                    <button className="btn-outline text-sm" onClick={() => downloadReport(assignment._id)}>
                      Download PDF Report
                    </button>
                  </div>
                  <div className="mt-4 text-sm bg-neutral-100 p-3 rounded">
                    Target: {assignment.targetDepartment || 'All Depts'} | Year {assignment.targetYear || 'All'} | Sec {assignment.targetSection || 'All'}
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <p className="text-sm text-ink-500">To grade submissions, go to assignment details (API supports /records grading).</p>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="dash-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="mod-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="text-xl font-medium mb-4">Post New Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4">
              <input required placeholder="Assignment Title" className="mod-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <textarea placeholder="Description" className="mod-input min-h-[100px]" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              
              <select required className="mod-input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                <option value="" disabled>Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>

              <label className="text-sm font-medium">Due Date</label>
              <input type="date" required className="mod-input" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />

              <div className="pt-2 border-t font-medium text-sm">Target Scope (Student Filter)</div>
              <input placeholder="Department (e.g. Computer Science)" className="mod-input" value={form.targetDepartment} onChange={e => setForm({...form, targetDepartment: e.target.value})} />
              <input type="number" placeholder="Year (e.g. 2)" min="1" max="6" className="mod-input" value={form.targetYear} onChange={e => setForm({...form, targetYear: e.target.value})} />
              <input placeholder="Section (e.g. A)" className="mod-input" value={form.targetSection} onChange={e => setForm({...form, targetSection: e.target.value})} />

              <div>
                <label className="text-sm font-medium">Assignment PDF</label>
                <input type="file" accept=".pdf" className="mod-input" onChange={e => setFile(e.target.files[0])} />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
