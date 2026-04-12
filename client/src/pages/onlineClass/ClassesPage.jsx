import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';
import LiveClassRoom from './LiveClassRoom.jsx';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  
  // Room entry
  const [activeClass, setActiveClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/classes');
      setClasses(data.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/classes', { title, subject, section });
      setShowCreateForm(false);
      fetchClasses();
      setTitle('');
      setSubject('');
      setSection('');
      // Auto-join the one just created
      setActiveClass(res.data.data);
    } catch (error) {
      alert('Error creating class: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEndClass = async (classId) => {
    try {
      if (confirm('Are you sure you want to end this live session for everyone?')) {
        await api.put(`/classes/${classId}/end`);
        fetchClasses();
      }
    } catch (error) {
      alert('Error ending class');
    }
  };

  // If inside a live room, mount it.
  if (activeClass) {
    return <LiveClassRoom classData={activeClass} onLeave={() => { setActiveClass(null); fetchClasses(); }} />;
  }

  if (loading) {
    return <div className="card text-center">Loading live classes...</div>;
  }

  return (
    <div className="module-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2 className="module-title">Live Class Rooms {user.role === 'student' && <span className="badge badge-primary" style={{marginLeft: 10}}>{user.section}</span>}</h2>
        {user.role === 'teacher' && (
          <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ Start Live Class'}
          </button>
        )}
      </div>

      {showCreateForm && user.role === 'teacher' && (
        <form className="card fade-in" onSubmit={handleCreateClass} style={{ marginBottom: '2rem' }}>
          <h3>Start New Live Session</h3>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', gridTemplateColumns: '1fr 1fr' }}>
            <input 
              type="text" 
              className="input-base" 
              placeholder="Topic / Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              className="input-base" 
              placeholder="Subject (e.g. CS101)" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              className="input-base" 
              placeholder="Target Section (e.g. A)" 
              value={section} 
              onChange={e => setSection(e.target.value)} 
              required 
              style={{ gridColumn: '1 / -1' }}
            />
            <button type="submit" className="btn-primary" style={{ justifySelf: 'start', gridColumn: '1 / -1' }}>
              Go Live Now 🔴
            </button>
          </div>
        </form>
      )}

      {classes.length === 0 ? (
        <div className="card text-center text-secondary">
          {user.role === 'student' ? 'No live classes currently running for your section.' : 'You have not started any live classes.'}
        </div>
      ) : (
        <div className="grid-responsive">
          {classes.map((c) => (
            <div key={c._id} className="card hover-up" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${c.status === 'live' ? 'badge-danger' : 'badge-secondary'}`}>
                  {c.status === 'live' ? '🔴 LIVE' : 'Ended'}
                </span>
                <span className="badge badge-primary">{c.subject}</span>
              </div>
              <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{c.title}</h3>
              <div className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                <div><strong>Teacher:</strong> {c.teacherId.fullName}</div>
                <div><strong>Section:</strong> {c.section}</div>
                <div><strong>Started:</strong> {new Date(c.startTime).toLocaleTimeString()}</div>
                {c.status === 'ended' && c.endTime && (
                  <div><strong>Ended:</strong> {new Date(c.endTime).toLocaleTimeString()}</div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {c.status === 'live' && (
                  <button 
                    className="btn-primary" 
                    onClick={() => setActiveClass(c)}
                    style={{ flex: 1 }}
                  >
                    Join Class
                  </button>
                )}
                {c.status === 'live' && user.role === 'teacher' && c.teacherId._id === user._id && (
                  <button 
                    className="btn-outline" 
                    onClick={() => handleEndClass(c._id)}
                    style={{ flex: 1, borderColor: '#e53e3e', color: '#e53e3e' }}
                  >
                    End Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
