import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ active, onNavigate, onLogout }) {
  const navigate = useNavigate();
  // Prototype-based nav structure
  const nav = [
    { label: 'Analytics', key: 'analytics', section: 'Overview' },
    { label: 'Courses', key: 'courses', section: 'Content' },
    { label: 'Posts', key: 'posts', section: 'Content' },
    { label: 'Categories', key: 'categories', section: 'Content' },
    { label: 'Tags', key: 'tags', section: 'Content' },
    { label: 'Comments', key: 'comments', section: 'Content' },
    { label: 'Media', key: 'media', section: 'Content' },
    { label: 'Compose', key: 'compose', section: 'Audience' },
    { label: 'Subscribers', key: 'subscribers', section: 'Audience' },
    { label: 'Campaigns', key: 'campaigns', section: 'Audience' },
    { label: 'Site Settings', key: 'settings', section: 'Configuration' },
  ];
  const sections = [
    'Overview', 'Content', 'Audience', 'Configuration'
  ];

  // Nav group and link components for pixel-perfect match
  const NavGroup = ({ title }) => (
    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-1">{title}</h3>
  );
  const NavLink = ({ currentView, viewName, children }) => {
    // Map viewName to URL path
    let path = '/admin';
    if (viewName === 'courses') path = '/admin/courses';
    else if (viewName === 'posts') path = '/admin/posts';
    else if (viewName === 'categories') path = '/admin/categories';
    else if (viewName === 'tags') path = '/admin/tags';
    else if (viewName === 'comments') path = '/admin/comments';
    else if (viewName === 'media') path = '/admin/media';
    else if (viewName === 'compose') path = '/admin/compose';
    else if (viewName === 'subscribers') path = '/admin/subscribers';
    else if (viewName === 'campaigns') path = '/admin/campaigns';
    else if (viewName === 'settings') path = '/admin/settings';
    // Analytics is default /admin
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left ${
          currentView === viewName
            ? 'text-white bg-slate-700'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
        style={{ boxShadow: 'none', background: currentView === viewName ? undefined : 'none' }}
      >
        {children}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 p-4 border-r border-slate-700 flex-shrink-0 hidden md:flex flex-col">
      <div className="text-white text-xl font-bold mb-8">Smart Hustle with AI</div>
      <nav className="space-y-1">
        {sections.map(section => (
          <div key={section}>
            <NavGroup title={section} />
            {nav.filter(n => n.section === section).map(item => (
              <NavLink key={item.key} currentView={active} viewName={item.key}>{item.label}</NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="mt-auto text-center text-xs text-slate-500">
        <p>Logged in as: <strong>Admin</strong></p>
  <button className="mt-2 hover:text-cyan-400" onClick={onLogout}>Log Out</button>
      </div>
    </aside>
  );
}
