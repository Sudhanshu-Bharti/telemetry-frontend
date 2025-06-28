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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4">Add a New Site</h2>
        <form onSubmit={e => { e.preventDefault(); onAdd(site); }} className="flex flex-col gap-3">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Site ID (e.g. example.com)"
            value={site.id}
            onChange={e => setSite(s => ({ ...s, id: e.target.value }))}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Site Name"
            value={site.name}
            onChange={e => setSite(s => ({ ...s, name: e.target.value }))}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Domain URL (https://...)"
            value={site.domainURL}
            onChange={e => setSite(s => ({ ...s, domainURL: e.target.value }))}
            required
          />
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm" disabled={loading}>
              {loading ? 'Adding...' : 'Add Site'}
            </button>
            <button type="button" className="text-gray-500 px-4 py-2 rounded text-sm" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
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
          <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
          <p className="mb-4 text-gray-600">You don't have any sites yet. Please add a site to get started.</p>
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
                  className="border rounded px-2 py-1 text-sm bg-white"
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
                className="ml-2 text-blue-600 hover:text-blue-800 p-1"
                onClick={() => setShowAdd(v => !v)}
                title="Add new site"
              >
                <Plus className="w-4 h-4" />
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
