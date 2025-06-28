import React, { useState } from "react";
import { MoreHorizontal, Settings, User, LogOut, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSite } from "../../contexts/SiteContext";

function AddSiteModal({ open, onClose, onAdd, loading, error }: {
  open: boolean;
  onClose: () => void;
  onAdd: (site: { id: string; name: string; domainURL: string }) => void;
  loading: boolean;
  error: string;
}) {
  const [site, setSite] = useState({ id: "", name: "", domainURL: "" });
  React.useEffect(() => {
    if (!open) setSite({ id: "", name: "", domainURL: "" });
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md relative animate-fade-in shadow-md">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-semibold mb-1 text-gray-900 tracking-tight">Add a New Site</h2>
        <p className="mb-5 text-gray-500 text-sm">Enter your site details to get started.</p>
        <form onSubmit={e => { e.preventDefault(); onAdd(site); }} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Site ID</label>
            <input
              className="border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 px-0 py-2 w-full bg-transparent text-base placeholder-gray-400 transition"
              placeholder="e.g. example.com"
              value={site.id}
              onChange={e => setSite(s => ({ ...s, id: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Site Name</label>
            <input
              className="border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 px-0 py-2 w-full bg-transparent text-base placeholder-gray-400 transition"
              placeholder="e.g. My Website"
              value={site.name}
              onChange={e => setSite(s => ({ ...s, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Domain URL</label>
            <input
              className="border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 px-0 py-2 w-full bg-transparent text-base placeholder-gray-400 transition"
              placeholder="https://example.com"
              value={site.domainURL}
              onChange={e => setSite(s => ({ ...s, domainURL: e.target.value }))}
              required
            />
          </div>
          {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold text-sm transition disabled:opacity-60" disabled={loading}>
              {loading ? 'Adding...' : 'Add Site'}
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded text-sm transition" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`.animate-fade-in{animation:fadeIn .18s cubic-bezier(.4,0,.2,1)}`}
      {`@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}`}</style>
    </div>
  );
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const { sites, currentSite, setCurrentSiteId, loading, addSite, hasSites } = useSite();
  const [showAdd, setShowAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleAddSite = async (site: { id: string; name: string; domainURL: string }) => {
    setAddError("");
    setAddLoading(true);
    try {
      if (!site.id || !site.name || !site.domainURL) {
        setAddError("All fields are required");
        setAddLoading(false);
        return;
      }
      await addSite(site);
      setShowAdd(false);
    } catch {
      setAddError("Failed to add site");
    } finally {
      setAddLoading(false);
    }
  };

  // Block dashboard if no sites
  if (!loading && !hasSites) {
    return (
      <>
        <AddSiteModal open={true} onClose={() => {}} onAdd={handleAddSite} loading={addLoading} error={addError} />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">Welcome!</h1>
          <p className="mb-4 text-gray-600 text-base">You don't have any sites yet. Please add a site to get started.</p>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AddSiteModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddSite} loading={addLoading} error={addError} />
      <nav className="w-full border-b border-gray-100 bg-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="font-semibold text-lg text-black tracking-tight">
              umami
            </span>
          </div>
          <div className="flex items-center gap-6">
            {/* Site Switcher */}
            <div className="relative">
              {loading ? (
                <span className="text-gray-400 text-sm">Loading sites...</span>
              ) : sites.length > 0 ? (
                <select
                  className="border-0 border-b border-gray-300 rounded-none px-0 py-2 text-sm bg-white focus:ring-0 focus:border-blue-600 transition"
                  value={currentSite?.id || ''}
                  onChange={e => setCurrentSiteId(e.target.value)}
                >
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.id})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-400 text-sm">No sites</span>
              )}
              <button
                className="ml-2 text-blue-600 hover:text-blue-800 p-1 rounded-full border border-blue-100 bg-blue-50 transition"
                onClick={() => setShowAdd(v => !v)}
                title="Add new site"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <a
              href="#"
              className="text-gray-900 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Realtime
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-3 mr-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
            </div>
          )}
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors">
            <User className="w-4 h-4" />
          </button>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-600 p-2 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>
      <main className="bg-white">{children}</main>
    </div>
  );
};
