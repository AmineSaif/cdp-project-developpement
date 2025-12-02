import React, { useContext, useState } from 'react';

const ProjectContext = React.createContext(null);

export function ProjectProvider({ children }) {
  const [project, setProjectState] = useState(null); // {id,name,projectCode,...}
  const [sprint, setSprint] = useState(null);   // {id,name,status}

  function setProject(p) {
    setProjectState(p);
    // À chaque changement de projet on réinitialise le sprint sélectionné
    setSprint(null);
  }

  const value = {
    project,
    sprint,
    setProject,
    setSprint,
    clearSelection() {
      setProjectState(null);
      setSprint(null);
    }
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  return useContext(ProjectContext);
}

export default ProjectContext;
