import { BarChart3, Plus, Edit, Trash2, Video } from 'lucide-react';
import { NavLink } from 'react-router';

function AdminPanel() {
  const adminOptions = [
    {
      id: 'dashboard',
      title: 'Reporting Dashboard',
      description: 'View platform reports and the latest analytics',
      icon: BarChart3,
      color: 'btn-primary',
      bgColor: 'bg-primary/10',
      route: '/admin/dashboard'
    },
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/10',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-[#121210] text-zinc-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4 text-3xl font-semibold text-zinc-100">
            Admin Panel
          </h1>
          <p className="text-lg text-zinc-400">
            Manage coding problems on your platform
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="cursor-pointer rounded-2xl border border-zinc-700 bg-[#242421] shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-2 hover:border-zinc-500"
              >
                <div className="items-center p-8 text-center">
                  {/* Icon */}
                  <div className="mb-4 rounded-full bg-indigo-500/10 p-4">
                    <IconComponent size={32} className="text-indigo-400" />
                  </div>
                  
                  {/* Title */}
                  <h2 className="mb-2 text-xl font-semibold text-zinc-100">
                    {option.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="mb-6 text-zinc-400">
                    {option.description}
                  </p>
                  
                  {/* Action Button */}
                    <NavLink 
                    to={option.route}
                   className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-400"
                   >
                   {option.title}
                   </NavLink>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default AdminPanel;
