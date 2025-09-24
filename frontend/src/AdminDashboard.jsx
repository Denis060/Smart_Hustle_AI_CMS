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
  const [filters, setFilters] = useState({ status: '', search: '', category: '' });
  const [categories, setCategories] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filter courses based on current filters
  const getFilteredCourses = () => {
    return courses.filter(course => {
      if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !course.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status && course.status !== filters.status) {
        return false;
      }
      if (filters.category && course.categoryId !== parseInt(filters.category)) {
        return false;
      }
      return true;
    });
  };

  // Get paginated courses
  const getPaginatedCourses = () => {
    const filteredCourses = getFilteredCourses();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCourses.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredCourses = getFilteredCourses();
    return Math.ceil(filteredCourses.length / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchCourses = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    
    axios.get(`/api/courses?${params.toString()}`)
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
  }, [filters.status, filters.search, filters.category]);

  const fetchCategories = () => {
    axios.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, [fetchCourses]);

  const handleAdd = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course) => {
    console.log('Editing course:', course);
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
      // Always use FormData for course creation/editing to support file upload
      let dataToSend;
      if (formData instanceof FormData) {
        dataToSend = formData;
      } else {
        dataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
      }
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      };
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse.id}`, dataToSend, config);
        alert('✅ Course updated successfully!');
        setIsModalOpen(false);
        fetchCourses();
      } else {
        const res = await axios.post('/api/courses', dataToSend, config);
        alert('✅ Course created successfully!');
        setIsModalOpen(false);
        // Optimistically add the new course to the list if response contains it
        if (res.data && res.data.id) {
          setCourses(prev => [res.data, ...prev]);
        } else {
          fetchCourses();
        }
      }
    } catch (err) {
      // 'err' is used in the alert below; this suppresses the lint warning
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
      console.error('Error viewing students:', err);
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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800 rounded-lg">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search courses..."
            className="w-full p-2 rounded bg-slate-700 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 rounded bg-slate-700 text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Category</label>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full p-2 rounded bg-slate-700 text-white text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4">Level</th>
              <th className="p-4">Category</th>
              <th className="p-4">Students</th>
              <th className="p-4">Price</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Type</th>
              <th className="p-4">Image</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {getPaginatedCourses().map(course => (
              <tr key={course.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-white">{course.title}</div>
                    <div className="text-slate-400 text-xs truncate max-w-xs" title={course.description}>
                      {course.description || '—'}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                    course.status === 'published' ? 'bg-green-200 text-green-800' :
                    course.status === 'draft' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {course.status || 'Draft'}
                  </span>
                </td>
                <td className="p-4 capitalize">{course.level || course.difficulty || '—'}</td>
                <td className="p-4">{course.category?.name || '—'}</td>
                <td className="p-4">{course.enrollmentCount || 0}</td>
                <td className="p-4">
                  {course.isOwned ? 
                    (course.price > 0 ? `${course.currency || 'USD'} ${course.price}` : 'Free') : 
                    'External'
                  }
                </td>
                <td className="p-4">
                  {course.featured && <span className="text-yellow-400">⭐</span>}
                </td>
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
                        : `http://localhost:5000${course.featuredImage}`)
                      : '/no-image.svg'}
                    alt="Course"
                    className="h-10 w-16 object-cover rounded"
                    onError={(e) => { e.target.src = '/no-image.svg'; }}
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

      {/* Pagination Controls */}
      {getTotalPages() > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-slate-300 text-sm">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredCourses().length)} of {getFilteredCourses().length} courses
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1 
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            {[...Array(getTotalPages())].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    isCurrentPage 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === getTotalPages()}
              className={`px-3 py-1 rounded ${
                currentPage === getTotalPages() 
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
  console.log('CourseModal rendered with course:', course);
  
  const [form, setForm] = useState({
    title: course?.title || '',
    provider: course?.provider || '',
    description: course?.description || '',
    featuredImage: course?.featuredImage || '',
    isOwned: course?.isOwned || false,
    affiliateLink: course?.affiliateLink || '',
    review: course?.review || '',
    price: course?.price || 0,
    currency: course?.currency || 'USD',
    duration: course?.duration || '',
    lessonCount: course?.lessonCount || 0,
    videoCount: course?.videoCount || 0,
    status: course?.status || 'draft',
    categoryId: course?.categoryId || null,
    level: course?.level || course?.difficulty || 'beginner',
    prerequisites: Array.isArray(course?.prerequisites) ? course.prerequisites : [],
    learningOutcomes: Array.isArray(course?.learningOutcomes) ? course.learningOutcomes : [],
    tags: Array.isArray(course?.tags) ? course.tags : [],
    featured: course?.featured || false
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    course?.featuredImage ? 
      (course.featuredImage.startsWith('http') ? course.featuredImage : `http://localhost:5000${course.featuredImage}`) 
      : ''
  );
  const [step, setStep] = useState(course ? 1 : 0);
  const [categories, setCategories] = useState([]);
  
  // Fetch categories for dropdown
  useEffect(() => {
    axios.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArrayChange = (field, index, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setForm(f => ({
      ...f,
      [field]: [...f[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setForm(f => ({
      ...f,
      [field]: f[field].filter((_, i) => i !== index)
    }));
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
    
    // Prepare form data with proper data types
    const processedForm = {
      ...form,
      // Convert categoryId to integer or null - handle empty string and invalid values
      categoryId: (form.categoryId && form.categoryId !== '') ? parseInt(form.categoryId) : null,
      // Convert numeric fields to proper types
      price: form.price ? parseFloat(form.price) : 0,
      lessonCount: form.lessonCount ? parseInt(form.lessonCount) : 0,
      videoCount: form.videoCount ? parseInt(form.videoCount) : 0,
      // Ensure boolean fields are proper booleans
      featured: Boolean(form.featured),
      external: !form.isOwned,
      // Convert arrays to JSON strings for FormData
      prerequisites: JSON.stringify(form.prerequisites || []),
      learningOutcomes: JSON.stringify(form.learningOutcomes || []),
      tags: JSON.stringify(form.tags || [])
    };
    
    let formData;
    if (imageFile) {
      formData = new FormData();
      Object.entries(processedForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      formData.append('image', imageFile);
    } else {
      formData = processedForm;
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
      <div className="bg-slate-800 rounded-xl w-full max-w-4xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        <form className="p-6" onSubmit={handleSubmit} encType="multipart/form-data">
          <h2 className="text-2xl font-bold text-white mb-6">{course ? 'Edit Course' : 'Add New Course'}</h2>
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-slate-400 mb-1">Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" rows={3} />
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-slate-400 mb-1">Level</label>
              <select name="level" value={form.level} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white">
                <option value="beginner">Beginner</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Duration</label>
              <input type="text" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g., 8 weeks, 20 hours" className="w-full p-2 rounded bg-slate-700 text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select name="categoryId" value={form.categoryId || ''} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white">
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-slate-400 mb-1">Lesson Count</label>
              <input type="number" name="lessonCount" value={form.lessonCount} onChange={handleChange} min="0" className="w-full p-2 rounded bg-slate-700 text-white" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Video Count</label>
              <input type="number" name="videoCount" value={form.videoCount} min="0" onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" />
            </div>
          </div>

          {/* Pricing (for owned courses) */}
          {form.isOwned && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-slate-400 mb-1">Price</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" className="w-full p-2 rounded bg-slate-700 text-white" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          <div className="mb-6">
            <label className="block text-slate-400 mb-2">Learning Outcomes</label>
            {form.learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
                  placeholder="What will students learn?"
                  className="flex-1 p-2 rounded bg-slate-700 text-white"
                />
                <button type="button" onClick={() => removeArrayItem('learningOutcomes', index)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('learningOutcomes')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">Add Learning Outcome</button>
          </div>

          {/* Prerequisites */}
          <div className="mb-6">
            <label className="block text-slate-400 mb-2">Prerequisites</label>
            {form.prerequisites.map((prereq, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={prereq}
                  onChange={(e) => handleArrayChange('prerequisites', index, e.target.value)}
                  placeholder="Required knowledge or skills"
                  className="flex-1 p-2 rounded bg-slate-700 text-white"
                />
                <button type="button" onClick={() => removeArrayItem('prerequisites', index)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('prerequisites')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">Add Prerequisite</button>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-slate-400 mb-2">Tags</label>
            {form.tags.map((tag, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                  placeholder="Course tag"
                  className="flex-1 p-2 rounded bg-slate-700 text-white"
                />
                <button type="button" onClick={() => removeArrayItem('tags', index)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded">Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem('tags')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">Add Tag</button>
          </div>

          {/* Course Image */}
          <div className="mb-6">
            <label className="block text-slate-400 mb-1">Course Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 rounded bg-slate-700 text-white" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-20 w-32 object-cover rounded border border-slate-600" />
            )}
          </div>

          {/* External Course Fields */}
          {!form.isOwned && (
            <>
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
            </>
          )}

          {/* Featured Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-slate-400">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="rounded"
              />
              Feature this course (show prominently)
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">{course ? 'Save Changes' : 'Add Course'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import AdminCompose from './AdminCompose';
import AdminSubscribers from './AdminSubscribers';
import AdminCampaigns from './AdminCampaigns';
import axios from 'axios';
import EnrollModal from './EnrollModal';
// removed duplicate import of Routes, Route, useLocation, useNavigate
import AdminSidebar from './AdminSidebar';
import AdminAnalytics from './AdminAnalytics';
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
                        : `http://localhost:5000${post.featuredImage}`)
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



function getActiveTab(pathname) {
  if (pathname === '/admin' || pathname === '/admin/') return 'analytics';
  const match = pathname.match(/^\/admin\/(\w+)/);
  return match ? match[1] : null;
}

function AdminDashboard({ onLogout }) {
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);
  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen flex">
      <AdminSidebar active={activeTab} onLogout={onLogout} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Routes>
          <Route path="" element={<AdminAnalytics />} />
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

