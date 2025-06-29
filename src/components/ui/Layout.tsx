import React, { useState } from "react";
import { Settings, User, LogOut, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useSite } from "../../contexts/SiteContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

function AddSiteModal({
  open,
  onClose,
  onAdd,
  loading,
  error,
}: {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(site);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
            Add a New Site
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            Enter your site details to get started.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label
              htmlFor="siteId"
              className="text-xs font-bold text-slate-700 uppercase tracking-wide"
            >
              Site ID
            </Label>
            <Input
              id="siteId"
              className="border-slate-200 focus:border-slate-900 transition-colors"
              placeholder="e.g. example.com"
              value={site.id}
              onChange={(e) => setSite((s) => ({ ...s, id: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="siteName"
              className="text-xs font-bold text-slate-700 uppercase tracking-wide"
            >
              Site Name
            </Label>
            <Input
              id="siteName"
              className="border-slate-200 focus:border-slate-900 transition-colors"
              placeholder="e.g. My Website"
              value={site.name}
              onChange={(e) => setSite((s) => ({ ...s, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="domainURL"
              className="text-xs font-bold text-slate-700 uppercase tracking-wide"
            >
              Domain URL
            </Label>
            <Input
              id="domainURL"
              className="border-slate-200 focus:border-slate-900 transition-colors"
              placeholder="https://example.com"
              value={site.domainURL}
              onChange={(e) =>
                setSite((s) => ({ ...s, domainURL: e.target.value }))
              }
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 p-3">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Site"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const { sites, currentSite, setCurrentSiteId, loading, addSite, hasSites } =
    useSite();
  const [showAdd, setShowAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleAddSite = async (site: {
    id: string;
    name: string;
    domainURL: string;
  }) => {
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
        <AddSiteModal
          open={true}
          onClose={() => {}}
          onAdd={handleAddSite}
          loading={addLoading}
          error={addError}
        />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">
            Welcome!
          </h1>
          <p className="mb-4 text-gray-600 text-base">
            You don't have any sites yet. Please add a site to get started.
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AddSiteModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAddSite}
        loading={addLoading}
        error={addError}
      />
      <nav className="w-full border-b border-slate-200 bg-white px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
            <span className="font-black text-xl text-slate-900 tracking-tight">
              Analytics
            </span>
          </div>
          <div className="flex items-center gap-8">
            {/* Site Switcher */}
            <div className="flex items-center gap-3">
              {loading ? (
                <span className="text-slate-400 text-sm font-medium">
                  Loading sites...
                </span>
              ) : sites.length > 0 ? (
                <Select
                  value={currentSite?.id || ""}
                  onValueChange={setCurrentSiteId}
                >
                  <SelectTrigger className="w-64 border-slate-200 focus:border-slate-900 transition-colors">
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {sites.map((site) => (
                      <SelectItem
                        key={site.id}
                        value={site.id}
                        className="hover:bg-slate-50"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {site.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {site.id}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-slate-400 text-sm font-medium">
                  No sites
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Site
              </Button>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-slate-900 text-sm font-bold hover:text-slate-600 transition-colors border-b-2 border-slate-900 pb-1"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
              >
                Realtime
              </a>
              <a
                href="#"
                className="text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
              >
                Reports
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4 mr-2">
              <span className="text-sm font-medium text-slate-700">
                Welcome, {user.name}
              </span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 hover:bg-slate-50"
              >
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-white border-slate-200 w-48"
              align="end"
            >
              <DropdownMenuItem className="hover:bg-slate-50 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-50 cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:bg-red-50 cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <main className="bg-slate-50">{children}</main>
    </div>
  );
};
