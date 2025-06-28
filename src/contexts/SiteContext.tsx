import React, { createContext, useContext, useEffect, useState } from 'react';
import { config } from '@/config/config';

export interface Site {
  id: string;
  name: string;
  domainURL: string;
  role?: string;
  eventCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface SiteContextType {
  sites: Site[];
  currentSiteId: string;
  currentSite: Site | undefined;
  setCurrentSiteId: (siteId: string) => void;
  refreshSites: () => Promise<void>;
  addSite: (site: { id: string; name: string; domainURL: string }) => Promise<void>;
  loading: boolean;
  hasSites: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within a SiteProvider');
  return ctx;
};

const SITE_ID_KEY = 'activeSiteId';

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [currentSiteId, setCurrentSiteIdState] = useState<string>(() => {
    return localStorage.getItem(SITE_ID_KEY) || config.defaultSiteId;
  });
  const [loading, setLoading] = useState(true);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiBaseUrl}/api/user-sites`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites || []);
        // If currentSiteId is not in the list, set to first site or fallback
        if (data.sites && data.sites.length > 0) {
          const found = data.sites.find((s: Site) => s.id === currentSiteId);
          if (!found) {
            setCurrentSiteIdState(data.sites[0].id);
            localStorage.setItem(SITE_ID_KEY, data.sites[0].id);
          }
        }
      } else {
        setSites([]);
      }
    } catch {
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
    // eslint-disable-next-line
  }, []);

  const setCurrentSiteId = (siteId: string) => {
    setCurrentSiteIdState(siteId);
    localStorage.setItem(SITE_ID_KEY, siteId);
  };

  const addSite = async (site: { id: string; name: string; domainURL: string }) => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiBaseUrl}/api/user-sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ siteId: site.id, name: site.name, domainURL: site.domainURL }),
      });
      if (res.ok) {
        await fetchSites();
      }
    } finally {
      setLoading(false);
    }
  };

  const value: SiteContextType = {
    sites,
    currentSiteId,
    currentSite: sites.find((s) => s.id === currentSiteId),
    setCurrentSiteId,
    refreshSites: fetchSites,
    addSite,
    loading,
    hasSites: sites.length > 0,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}; 