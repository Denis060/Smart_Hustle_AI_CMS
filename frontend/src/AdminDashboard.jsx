import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
function AdminPostEditorLoader() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-slate-300">Loading...</div>;
  if (!post) return <div className="text-red-400">Post not found.</div>;

  return <AdminPostEditor post={post} isEdit={true} onSave={async (data) => {
    await axios.put(`/api/posts/${id}`, data, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
    navigate('/admin');
  }} />;
}

// Enroll Modal (exported for use in PublicCourses)

// Students List Modal (not exported)
function StudentsListModal({ course, students, loading, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Enrolled Students - {course.title}</h2>
        {loading ? (
          <div className="text-slate-300">Loading...</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-300 mb-4">
            <thead className="text-xs text-slate-400 uppercase bg-slate-700">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Interest</th>
                <th className="p-2">Motivation</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-slate-400">No students enrolled yet.</td></tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className="border-b border-slate-700">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.interest || '—'}</td>
                    <td className="p-2">{s.motivation || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}
function CoursesSection() {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [enrollModalCourse, setEnrollModalCourse] = useState(null);
  const [studentsModalCourse, setStudentsModalCourse] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchCourses = () => {
    axios.get('/api/courses')
      .then(res => {
        console.log('Courses API response:', res.data);
        if (Array.isArray(res.data)) {
          setCourses(res.data);
        } else if (res.data && Array.isArray(res.data.rows)) {
          setCourses(res.data.rows);
        } else {
          setCourses([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch courses:', err);
        setCourses([]);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
  await axios.delete(`/api/courses/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      fetchCourses();
    } catch (err) {
      alert('Failed to delete course: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleModalSave = async (formData) => {
    try {
      if (editingCourse) {
  await axios.put(`/api/courses/${editingCourse.id}`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
        setIsModalOpen(false);
        fetchCourses();
      } else {
  const res = await axios.post('/api/courses', formData, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
        setIsModalOpen(false);
        // Optimistically add the new course to the list if response contains it
        if (res.data && res.data.id) {
          setCourses(prev => [res.data, ...prev]);
        } else {
          fetchCourses();
        }
      }
    } catch (err) {
      alert('Failed to save course: ' + (err.response?.data?.error || err.message));
    }
  };

  // Handler for viewing students
  const handleViewStudents = async (course) => {
    setStudentsModalCourse(course);
    setLoadingStudents(true);
    try {
      const res = await axios.get(`/api/enrollments/course/${course.id}`);
      setStudentsList(res.data);
    } catch (err) {
      setStudentsList([]);
    }
    setLoadingStudents(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Courses</h1>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg" onClick={handleAdd}>Add New Course</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Level</th>
              <th className="p-4">Description</th>
              <th className="p-4">Type</th>
              <th className="p-4">Image</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4">{course.title}</td>
                <td className="p-4 capitalize">{course.level || '—'}</td>
                <td className="p-4 max-w-xs truncate" title={course.description}>{course.description || '—'}</td>
                <td className="p-4">
                  <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full 
                      ${course.isOwned ? 'bg-cyan-400 text-slate-900' : 'bg-indigo-200 text-indigo-700'}`}
                  >
                    {course.isOwned ? 'MY COURSE' : 'RECOMMENDED'}
                  </span>
                </td>
                <td className="p-4">
                  <img
                    src={course.featuredImage
                      ? (course.featuredImage.startsWith('http')
                        ? course.featuredImage
                        : `/api${course.featuredImage}`)
                      : '/no-image.png'}
                    alt="Course"
                    className="h-10 w-16 object-cover rounded"
                  />
                </td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  {course.isOwned ? (
                    <>
                      <button className="text-cyan-400 hover:underline" onClick={() => handleViewStudents(course)}>View Students</button>
                      <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-3 rounded-lg" onClick={() => setEnrollModalCourse(course)}>Enroll</button>
                    </>
                  ) : (
                    <a
                      href={course.affiliateLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-200 text-indigo-700 font-bold py-1 px-3 rounded-lg hover:bg-indigo-300"
                    >
                      Go to Course
                    </a>
                  )}
                  <button className="text-slate-400 hover:text-white ml-2" onClick={() => handleEdit(course)}>Edit</button>
                  <button className="text-red-400 hover:text-red-600 ml-2" onClick={() => handleDelete(course.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && <CourseModal course={editingCourse} onClose={() => setIsModalOpen(false)} onSave={handleModalSave} />}
      {enrollModalCourse && (
        <EnrollModal
          course={enrollModalCourse}
          onClose={() => setEnrollModalCourse(null)}
        />
      )}
      {studentsModalCourse && (
        <StudentsListModal
          course={studentsModalCourse}
          students={studentsList}
          loading={loadingStudents}
          onClose={() => setStudentsModalCourse(null)}
        />
      )}
    </div>
  );

// Students List Modal
function StudentsListModal({ course, students, loading, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Enrolled Students - {course.title}</h2>
        {loading ? (
          <div className="text-slate-300">Loading...</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-300 mb-4">
            <thead className="text-xs text-slate-400 uppercase bg-slate-700">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Interest</th>
                <th className="p-2">Motivation</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-slate-400">No students enrolled yet.</td></tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className="border-b border-slate-700">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.email}</td>
                    <td className="p-2">{s.interest || '—'}</td>
                    <td className="p-2">{s.motivation || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
}
}

function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState({
    title: course?.title || '',
    provider: course?.provider || '',
    description: course?.description || '',
    featuredImage: course?.featuredImage || '', // Will store the URL after upload
    isOwned: course?.isOwned || false,
    affiliateLink: course?.affiliateLink || '',
    review: course?.review || ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(course?.featuredImage || '');
  const [step, setStep] = useState(course ? 1 : 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formData;
    if (imageFile) {
      formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('image', imageFile);
    } else {
      formData = { ...form };
    }
    onSave(formData);
  };

  // Step 0: Ask if it's owned
  if (step === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-6">Is this course owned by us?</h2>
          <div className="flex gap-6">
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg" onClick={() => { setForm(f => ({ ...f, isOwned: true })); setStep(1); }}>Yes, it's ours</button>
            <button className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg" onClick={() => { setForm(f => ({ ...f, isOwned: false })); setStep(1); }}>No, it's external</button>
          </div>
          <button className="mt-8 text-slate-400 hover:text-white underline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  // Step 1: Show form
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
        <form className="p-6" onSubmit={handleSubmit} encType="multipart/form-data">
          <h2 className="text-2xl font-bold text-white mb-6">{course ? 'Edit Course' : 'Add New Course'}</h2>
          <div className="mb-4">
            <label className="block text-slate-400 mb-1">Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" rows={3} />
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 mb-1">Level</label>
            <select name="level" value={form.level || ''} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" required>
              <option value="">Select level</option>
              <option value="Beginner">Beginner</option>
              <option value="Medium">Medium</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 mb-1">Course Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 rounded bg-slate-700 text-white" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-32 object-cover rounded border border-slate-600" />
            )}
          </div>
          {!form.isOwned && <>
            <div className="mb-4">
              <label className="block text-slate-400 mb-1">Provider</label>
              <input type="text" name="provider" value={form.provider} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" />
            </div>
            <div className="mb-4">
              <label className="block text-slate-400 mb-1">Affiliate Link</label>
              <input type="text" name="affiliateLink" value={form.affiliateLink} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" />
            </div>
            <div className="mb-4">
              <label className="block text-slate-400 mb-1">Review</label>
              <textarea name="review" value={form.review} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" rows={2} />
            </div>
          </>}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">{course ? 'Save Changes' : 'Add Course'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import AdminCompose from './AdminCompose';
import AdminSubscribers from './AdminSubscribers';
import AdminCampaigns from './AdminCampaigns';
import axios from 'axios';
import EnrollModal from './EnrollModal';
// removed duplicate import of Routes, Route, useLocation, useNavigate
import AdminSidebar from './AdminSidebar';
import AdminPostEditor from './AdminPostEditor';
import AdminCategories from './AdminCategories';
import AdminTags from './AdminTags';
import AdminComments from './AdminComments';
import AdminMedia from './AdminMedia';
import AdminSettings from './AdminSettings';

function PostsSection() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get('/api/posts', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(res => setPosts(res.data.posts || []))
      .catch(() => setPosts([]));
  }, []);
  // Delete post handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`/api/posts/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setPosts(posts => posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete post: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Posts</h1>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg" onClick={() => navigate('/admin/posts/new')}>Add New Post</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Published</th>
              <th className="p-4">Image</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4">{post.title}</td>
                <td className="p-4">{post.User ? post.User.name || post.User.username : post.authorId || '—'}</td>
                <td className="p-4">{post.publishedAt || post.createdAt?.slice(0, 10) || ''}</td>
                <td className="p-4">
                  <img
                    src={post.featuredImage
                      ? (post.featuredImage.startsWith('http')
                        ? post.featuredImage
                        : `/api/${post.featuredImage}`)
                      : '/no-image.png'}
                    alt="Post"
                    className="h-10 w-16 object-cover rounded"
                  />
                </td>
                <td className="p-4"><span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${post.published ? 'text-emerald-600 bg-emerald-200' : 'text-slate-500 bg-slate-700'}`}>{post.published ? 'Published' : 'Draft'}</span></td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  <button className="text-slate-400 hover:text-white" onClick={() => navigate(`/admin/posts/edit/${post.id}`)}>Edit</button>
                  <button className="text-red-400 hover:text-red-600" onClick={() => handleDelete(post.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen flex">
      <AdminSidebar active={null} onLogout={onLogout} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Routes>
          <Route path="" element={<div className="text-2xl font-bold text-white">Welcome to Analytics Dashboard</div>} />
          <Route path="posts" element={<PostsSection />} />
          <Route path="courses" element={<CoursesSection />} />
          <Route path="posts/new" element={<AdminPostEditor isEdit={false} onSave={async (data) => {
            await axios.post('/api/posts', data, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
            window.location.href = '/admin/posts';
          }} />} />
          <Route path="posts/edit/:id" element={<AdminPostEditorLoader />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="comments" element={<AdminComments />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="compose" element={<AdminCompose />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;

