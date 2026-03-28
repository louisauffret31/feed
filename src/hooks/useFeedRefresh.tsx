import * as React from 'react';

type FeedRefreshContextType = {
  refresh: () => void;
  refreshKey: number;
};

export const FeedRefreshContext = React.createContext<FeedRefreshContextType>({
  refresh: () => {},
  refreshKey: 0,
});

export function FeedRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = React.useState(0);

  function refresh() {
    setRefreshKey(k => k + 1);
  }

  return (
    <FeedRefreshContext.Provider value={{ refresh, refreshKey }}>
      {children}
    </FeedRefreshContext.Provider>
  );
}

export function useFeedRefresh() {
  return React.useContext(FeedRefreshContext);
}