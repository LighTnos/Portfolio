import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  getAnalytics,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchGithubRepos,
  createProjectFromRepo,
  uploadImage,
  adminLogout,
  BACKEND_URL,
} from '../api'
import SEO from '../components/SEO.jsx'

// ── Icons ──────────────────────────────────────────────────────────────────────
const ChartIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
const FolderIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
)
const GithubIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub }) => (
  <div className="rounded-2xl p-5"
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <p className="text-white/30 text-[10px] font-light uppercase tracking-[0.16em] mb-2">{label}</p>
    <p className="text-white text-2xl sm:text-3xl font-medium" style={{ letterSpacing: '-0.04em' }}>{value}</p>
    {sub && <p className="text-white/25 text-xs font-light mt-1">{sub}</p>}
  </div>
)

// ── Project Form Modal ─────────────────────────────────────────────────────────
const ProjectFormModal = ({ project, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: project?.title || '',
    domain: project?.domain || '',
    description: project?.description || '',
    techStack: project?.techStack?.join(', ') || '',
    liveDemoUrl: project?.liveDemoUrl || '',
    githubUrl: project?.githubUrl || '',
    imageUrl: project?.imageUrl || '',
  })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(project?.imageUrl ? `${BACKEND_URL}${project.imageUrl}` : null)
  const [imageError, setImageError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleImageChange = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image must be less than 5MB')
      return
    }

    setImageError('')

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)

    // Upload image
    setUploadingImage(true)
    try {
      const result = await uploadImage(file)
      setForm({ ...form, imageUrl: result.imageUrl })
      setImagePreview(`${BACKEND_URL}${result.imageUrl}`)
    } catch (err) {
      setImageError(err.message || 'Failed to upload image. Please try again.')
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) handleImageChange(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageChange(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setForm({ ...form, imageUrl: '' })
    setImageError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...form,
        techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean),
      }
      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = `w-full rounded-xl font-light text-white text-sm
                    placeholder-white/20 outline-none transition-all duration-200
                    bg-white/5 border border-white/10
                    focus:bg-white/10 focus:border-white/25 px-4 py-3`

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: 'rgba(10,10,10,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        }}>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-medium" style={{ letterSpacing: '-0.03em' }}>
              {project ? 'Edit Project' : 'New Project'}
            </h3>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'title', label: 'Title', placeholder: 'Project title', required: true },
              { key: 'domain', label: 'Domain', placeholder: 'e.g., Web Development, AI/ML', required: true },
              { key: 'techStack', label: 'Tech Stack', placeholder: 'React, Node.js, MongoDB (comma separated)' },
              { key: 'liveDemoUrl', label: 'Live Demo URL', placeholder: 'https://...', type: 'url' },
              { key: 'githubUrl', label: 'GitHub URL', placeholder: 'https://github.com/...', type: 'url' },
            ].map(({ key, label, placeholder, required, type }) => (
              <div key={key}>
                <label className="text-white/30 text-[10px] font-light uppercase tracking-[0.14em] block mb-1.5 pl-0.5">{label}</label>
                <input
                  type={type || 'text'} required={required}
                  value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className="text-white/30 text-[10px] font-light uppercase tracking-[0.14em] block mb-1.5 pl-0.5">Description</label>
              <textarea
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief project description..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-white/30 text-[10px] font-light uppercase tracking-[0.14em] block mb-1.5 pl-0.5">
                Project Image {imagePreview && <span className="text-green-400/60">✓</span>}
              </label>

              {imagePreview && (
                <div className="mb-3 relative group">
                  <div className="rounded-xl overflow-hidden border border-white/10" style={{ maxHeight: '200px' }}>
                    <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium transition-all opacity-0 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${dragActive
                  ? 'border-white/40 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                  } ${uploadingImage ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="project-image-upload"
                />
                <div className="p-6 text-center">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-white/40 text-xs">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-white/40">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-white/50 text-xs font-light">
                        {imagePreview ? 'Click or drag to replace image' : 'Click or drag to upload image'}
                      </p>
                      <p className="text-white/30 text-[10px] font-light">PNG, JPG, GIF, WEBP (max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {imageError && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400/80 text-xs font-light">{imageError}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={saving || uploadingImage}
              className="w-full rounded-full font-medium text-white text-sm uppercase tracking-widest py-3 transition-all duration-300"
              style={{
                background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
                outline: '2px solid #FFFFFF',
                outlineOffset: '-3px',
                border: 'none',
                opacity: saving ? 0.55 : 1,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}>
              {saving ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── GitHub Import Modal ────────────────────────────────────────────────────────
const GithubImportModal = ({ onClose, onImported }) => {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchGithubRepos()
        // Handle new response format with success and repos fields
        if (data.success && data.repos) {
          setRepos(data.repos)
        } else if (Array.isArray(data)) {
          // Fallback for old format
          setRepos(data)
        } else {
          setError(data.message || 'Failed to fetch GitHub repos')
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch GitHub repos. Check your access token.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleImport = async (repoName) => {
    setImporting(repoName)
    setError('')
    setSuccess('')
    try {
      await createProjectFromRepo(repoName)
      setSuccess(`"${repoName}" imported successfully!`)
      // Call onImported callback to reload projects in parent component
      if (onImported) onImported()
    } catch (err) {
      if (err.status === 0) {
        setError('Connection failed. Please try again.')
      } else if (err.status === 401) {
        setError('GitHub token is invalid or missing.')
      } else if (err.status === 404) {
        setError(`Repository "${repoName}" not found.`)
      } else if (err.status === 403) {
        setError('GitHub API rate limit exceeded or insufficient permissions.')
      } else {
        setError(err.message || 'Import failed. Please try again.')
      }
    } finally {
      setImporting(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(28px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div>
            <h3 className="text-white text-lg font-medium" style={{ letterSpacing: '-0.03em' }}>
              Import from GitHub
            </h3>
            <p className="text-white/30 text-xs font-light mt-1">
              Select a repo — AI will generate the project details.
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-red-400/80 text-xs font-light">{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <span className="text-green-400/80 text-xs font-light">{success}</span>
          </div>
        )}

        {/* Repo list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : repos.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-12">No repositories found.</p>
          ) : (
            repos.map((repo) => (
              <div key={repo.id}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{repo.name}</p>
                  <p className="text-white/30 text-xs font-light truncate mt-0.5">
                    {repo.description || 'No description'}
                    {repo.private && <span className="ml-2 text-yellow-500/60">● Private</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleImport(repo.name)}
                  disabled={importing !== null}
                  className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium text-white transition-all duration-200"
                  style={{
                    background: importing === repo.name ? 'rgba(182,0,168,0.3)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    opacity: (importing && importing !== repo.name) ? 0.4 : 1,
                    cursor: importing ? 'not-allowed' : 'pointer',
                  }}>
                  {importing === repo.name ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Importing...
                    </span>
                  ) : 'Import'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('analytics')
  const [analytics, setAnalytics] = useState(null)
  const [projects, setProjects] = useState([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [showGithubImport, setShowGithubImport] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Fetch analytics
  const loadAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const data = await getAnalytics()
      setAnalytics(data.data)
    } catch (err) {
      if (err.status === 401) {
        navigate('/admin')
        return
      }
      if (import.meta.env.DEV) console.error('Analytics error:', err)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  // Fetch projects
  const loadProjects = async () => {
    setLoadingProjects(true)
    try {
      const data = await getProjects()
      setProjects(data.projects || [])
    } catch (err) {
      if (import.meta.env.DEV) console.error('Projects error:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  // Session check on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await getAnalytics()
      } catch (err) {
        if (err.status === 401) {
          navigate('/admin')
        }
      }
    }
    checkSession()
  }, [navigate])

  useEffect(() => {
    loadAnalytics()
    loadProjects()
  }, [])

  // Handlers
  const handleLogout = async () => {
    try {
      await adminLogout()
      navigate('/admin')
    } catch {
      // Even if logout fails, redirect to login
      navigate('/admin')
    }
  }

  const handleSaveProject = async (data) => {
    if (editingProject) {
      await updateProject(editingProject._id, data)
    } else {
      await createProject(data)
    }
    setShowProjectForm(false)
    setEditingProject(null)
    loadProjects()
  }

  const handleDeleteProject = async (id) => {
    await deleteProject(id)
    setDeleteConfirm(null)
    loadProjects()
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowProjectForm(true)
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: <ChartIcon /> },
    { id: 'projects', label: 'Projects', icon: <FolderIcon /> },
    { id: 'github', label: 'GitHub Import', icon: <GithubIcon /> },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0C0C0C' }}>
      <SEO
        title="Admin Dashboard | Lightnos.dev"
        description="Admin dashboard for managing portfolio projects and analytics"
      />
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-8"
          style={{ backgroundColor: '#B600A8', filter: 'blur(120px)', left: '10%', top: '5%' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-6"
          style={{ backgroundColor: '#7621B0', filter: 'blur(100px)', right: '10%', bottom: '20%' }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/[0.06]"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <a href="/" className="text-white text-lg font-medium" style={{ letterSpacing: '-0.04em' }}>
            Lightnos<span className="text-white/50">.dev</span>
          </a>
          <span className="text-white/20 text-xs">/ admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-white/40 text-sm font-light hover:text-white/70 transition-colors">
            ← Back to site
          </a>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm font-light text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all duration-200"
            style={{ letterSpacing: '-0.01em' }}>
            Logout
          </button>
        </div>
      </header>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">

        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-3 lg:p-4"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-light whitespace-nowrap transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-white/[0.08] border border-white/15 text-white'
                    : 'border border-transparent text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
                  }`}
                style={{ letterSpacing: '-0.01em' }}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-white text-xl sm:text-2xl font-medium" style={{ letterSpacing: '-0.03em' }}>
                  Analytics
                </h2>
                <button onClick={loadAnalytics}
                  className="text-white/30 text-xs font-light hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
                  Refresh
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  ))}
                </div>
              ) : analytics ? (
                <div className="space-y-8">
                  {/* Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Visits" value={analytics.overview.totalVisits} />
                    <StatCard label="Today" value={analytics.overview.visitsToday} sub={`${analytics.overview.uniqueVisitorsToday} unique`} />
                    <StatCard label="This Week" value={analytics.overview.visitsThisWeek} sub={`${analytics.overview.uniqueVisitorsThisWeek} unique`} />
                    <StatCard label="This Month" value={analytics.overview.visitsThisMonth} />
                  </div>

                  {/* Top Pages */}
                  {analytics.topPages.length > 0 && (
                    <div>
                      <h3 className="text-white/50 text-xs font-light uppercase tracking-[0.16em] mb-4">Top Pages</h3>
                      <div className="space-y-1.5">
                        {analytics.topPages.map((page, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="text-white/60 text-sm font-light">{page.page}</span>
                            <span className="text-white/30 text-xs font-light">{page.visits} visits</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Projects */}
                  {analytics.popularProjects.length > 0 && (
                    <div>
                      <h3 className="text-white/50 text-xs font-light uppercase tracking-[0.16em] mb-4">Popular Projects</h3>
                      <div className="space-y-1.5">
                        {analytics.popularProjects.map((project, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="text-white/60 text-sm font-light">{project.title}</span>
                            <span className="text-white/30 text-xs font-light">{project.views} views</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daily Visits Line Chart */}
                  {analytics.dailyVisits.length > 0 && (
                    <div>
                      <h3 className="text-white/50 text-xs font-light uppercase tracking-[0.16em] mb-4">Daily Visits (Last 30 Days)</h3>
                      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={analytics.dailyVisits}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                              dataKey="date"
                              stroke="rgba(255,255,255,0.3)"
                              style={{ fontSize: '11px' }}
                              tickFormatter={(value) => {
                                const date = new Date(value)
                                return `${date.getMonth() + 1}/${date.getDate()}`
                              }}
                            />
                            <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                              }}
                              labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="visits"
                              stroke="rgba(182,0,168,0.8)"
                              strokeWidth={2}
                              dot={{ fill: 'rgba(182,0,168,0.6)', r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Popular Projects Bar Chart */}
                  {analytics.popularProjects.length > 0 && (
                    <div>
                      <h3 className="text-white/50 text-xs font-light uppercase tracking-[0.16em] mb-4">Popular Projects</h3>
                      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={analytics.popularProjects.slice(0, 10).map(p => ({ name: p.title.length > 20 ? p.title.substring(0, 20) + '...' : p.title, views: p.views }))}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              stroke="rgba(255,255,255,0.3)"
                              style={{ fontSize: '11px' }}
                              width={120}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                              }}
                            />
                            <Bar dataKey="views" fill="rgba(215,226,234,0.6)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  {analytics.recentActivity.length > 0 && (
                    <div>
                      <h3 className="text-white/50 text-xs font-light uppercase tracking-[0.16em] mb-4">Recent Activity</h3>
                      <div className="space-y-1">
                        {analytics.recentActivity.map((visit, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                            style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                            <span className="text-white/50 text-xs font-light">{visit.page}</span>
                            <span className="text-white/20 text-[10px] font-light">
                              {new Date(visit.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white/30 text-sm">No analytics data available.</p>
              )}
            </div>
          )}

          {/* ── PROJECTS TAB ── */}
          {activeTab === 'projects' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-white text-xl sm:text-2xl font-medium" style={{ letterSpacing: '-0.03em' }}>
                  Projects <span className="text-white/30 text-lg">({projects.length})</span>
                </h2>
                <button onClick={() => { setEditingProject(null); setShowProjectForm(true) }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                    boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
                    outline: '2px solid #FFFFFF',
                    outlineOffset: '-3px',
                  }}>
                  <PlusIcon /> New Project
                </button>
              </div>

              {loadingProjects ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white/30 text-sm mb-4">No projects yet.</p>
                  <button onClick={() => { setEditingProject(null); setShowProjectForm(true) }}
                    className="text-white/50 text-sm font-light hover:text-white/80 transition-colors underline underline-offset-4">
                    Create your first project
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {projects.map((project) => (
                    <div key={project._id}
                      className="flex items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-2xl group transition-all duration-200"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="text-white/80 text-sm font-medium truncate">{project.title}</h4>
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider bg-white/5 border border-white/10 text-white/40">
                            {project.domain}
                          </span>
                        </div>
                        <p className="text-white/30 text-xs font-light truncate">{project.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {project.techStack?.map((tech) => (
                            <span key={tech} className="px-2 py-0.5 rounded-md text-[9px] font-light bg-white/[0.03] border border-white/[0.06] text-white/35">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => handleEditProject(project)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                          title="Edit">
                          <EditIcon />
                        </button>
                        {deleteConfirm === project._id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteProject(project._id)}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all">
                              Confirm
                            </button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-white/40 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(project._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete">
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── GITHUB IMPORT TAB ── */}
          {activeTab === 'github' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-white text-xl sm:text-2xl font-medium" style={{ letterSpacing: '-0.03em' }}>
                    GitHub Import
                  </h2>
                  <p className="text-white/30 text-xs font-light mt-1">
                    Import repositories and let AI generate project descriptions.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowGithubImport(true)}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium text-white uppercase tracking-wider transition-all duration-200"
                style={{
                  background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                  boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
                  outline: '2px solid #FFFFFF',
                  outlineOffset: '-3px',
                }}>
                <GithubIcon /> Browse Repositories
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      {showProjectForm && (
        <ProjectFormModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => { setShowProjectForm(false); setEditingProject(null) }}
        />
      )}
      {showGithubImport && (
        <GithubImportModal
          onClose={() => setShowGithubImport(false)}
          onImported={() => loadProjects()}
        />
      )}
    </div>
  )
}

export default AdminDashboard
