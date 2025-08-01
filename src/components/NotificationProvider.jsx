import { createContext } from "react";
import { useState } from "react";
export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = () => setRefreshKey(prev => prev + 1);

    return (
        <NotificationContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </NotificationContext.Provider>
    );
}
