import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
interface ProjectContextType {
    activeProjectId: string | null;
    setActiveProjectId: (id: string | null) => void;
}
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
export const ProjectProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const location = useLocation();
    useEffect(() => {
        const projectPathMatch = location.pathname.match(/\/projects\/([^/]+)/);
        const newId = (projectPathMatch && projectPathMatch[1] !== 'new') ? projectPathMatch[1] : null;
        if (newId !== activeProjectId) {
            setActiveProjectId(newId);
        }
    }, [location.pathname, activeProjectId]);
    return (<ProjectContext.Provider value={{ activeProjectId, setActiveProjectId }}>
      {children}
    </ProjectContext.Provider>);
};
export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
