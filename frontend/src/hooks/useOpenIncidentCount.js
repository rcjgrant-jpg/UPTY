import { useEffect, useState } from "react";
import { listIncidents } from "../api/incidents";

export default function useOpenIncidentCount(pollMs = 30000) {
  const [openIncidentCount, setOpenIncidentCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadCount = async () => {
      try {
        const data = await listIncidents();
        const incidents = data.incidents || [];
        const openCount = incidents.filter((incident) => !incident.is_resolved).length;

        if (isMounted) {
          setOpenIncidentCount(openCount);
        }
      } catch {
        if (isMounted) {
          setOpenIncidentCount(0);
        }
      }
    };

    loadCount();

    const interval = setInterval(loadCount, pollMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pollMs]);

  return openIncidentCount;
}
