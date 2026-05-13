import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';

// ==================== STEP DEFINITIONS (same as before) ====================
const stepsByPath = {
  '/dashboard': [
    { target: '[data-tut="stats-cards"]', title: 'Statistics Overview', content: 'See total users, uploaded works, and pending signup requests at a glance.', placement: 'bottom' },
    { target: '[data-tut="recent-users-table"]', title: 'Recent User Activity', content: 'View the most recently registered users and their current status.', placement: 'top' },
    { target: '[data-tut="works-table"]', title: 'Recent Artwork Submissions', content: 'Check the latest artworks uploaded by students and faculty.', placement: 'top' },
  ],
  '/user': [
    { target: '[data-tut="create-user-btn"]', title: 'Create User', content: 'Add new student, faculty, or admin accounts.', placement: 'right' },
    { target: '[data-tut="search-filter-users"]', title: 'Search & Filter', content: 'Search by name/email or filter by role.', placement: 'bottom' },
    { target: '[data-tut="users-table"]', title: 'User Management', content: 'Approve, suspend, restore, or edit user accounts.', placement: 'top' },
    { target: '[data-tut="export-csv"]', title: 'Export Users', content: 'Download the current filtered list as CSV.', placement: 'left' },
  ],
  '/works': [
    { target: '[data-tut="stats-cards"]', title: 'Artwork Statistics', content: 'Quick view of total, published, and monthly works.', placement: 'bottom' },
    { target: '[data-tut="search-filters"]', title: 'Filter & Search', content: 'Find artworks by status, date, or title/author.', placement: 'bottom' },
    { target: '[data-tut="works-table"]', title: 'Artworks Table', content: 'Edit, publish, remove, or restore individual artworks.', placement: 'top' },
    { target: '[data-tut="upload-work"]', title: 'Upload New Artwork', content: 'Add a new artwork (always published).', placement: 'right' },
  ],
  '/requests': [
    { target: '[data-tut="request-tabs"]', title: 'Request Types', content: 'Switch between artwork upload requests and account creation requests.', placement: 'bottom' },
    { target: '[data-tut="bulk-actions"]', title: 'Bulk Approvals', content: 'Approve selected requests or all pending requests at once.', placement: 'bottom' },
    { target: '[data-tut="requests-table"]', title: 'Pending Requests', content: 'Click any row to review details, edit, then approve or reject.', placement: 'top' },
    { target: '[data-tut="undo-last"]', title: 'Undo Last Action', content: 'Revert the last batch approval if needed.', placement: 'left' },
  ],
  '/admin/settings': [
    { target: '[data-tut="global-settings"]', title: 'Global Settings', content: 'Control registration, auto‑approve for students, and upload limits.', placement: 'auto' },
    { target: '[data-tut="maintenance-mode"]', title: 'Maintenance Mode', content: 'Put the site into maintenance (only staff can access).', placement: 'right' },
    { target: '[data-tut="save-settings"]', title: 'Save Changes', content: 'Don’t forget to save after changing settings.', placement: 'top' },
  ],
};

// Inject global CSS to style the beacon (the starting dot)
const beaconsStyle = `
.react-joyride__beacon {
  filter: drop-shadow(0 0 8px #a1ff14) drop-shadow(0 0 4px #a1ff14) !important;
}
.react-joyride__beacon svg circle,
.react-joyride__beacon svg path {
  fill: #a1ff14 !important;
  stroke: #a1ff14 !important;
}
.react-joyride__beacon__inner {
  background-color: #a1ff14 !important;
  box-shadow: 0 0 0 4px #a1ff14, 0 0 0 8px rgba(161, 255, 20, 0.4) !important;
}
`;

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

export const TutorialProvider = ({ children }) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const tooltipRef = useRef(null);

  // Inject the beacon style once
  useEffect(() => {
    if (document.getElementById('joyride-beacon-style')) return;
    const style = document.createElement('style');
    style.id = 'joyride-beacon-style';
    style.textContent = beaconsStyle;
    document.head.appendChild(style);
  }, []);

  // Handle clicks outside the tooltip to exit the tutorial
  useEffect(() => {
    if (!run) return;

    const handleClickOutside = (event) => {
      // Find the tooltip element (it may not have a fixed class, but Joyride uses .react-joyride__tooltip)
      const tooltip = document.querySelector('.react-joyride__tooltip');
      if (tooltip && !tooltip.contains(event.target)) {
        setRun(false);
        setStepIndex(0);
      }
    };

    // Add a slight delay to allow the tooltip to be mounted
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [run]);

  useEffect(() => {
    const path = window.location.pathname;
    const newSteps = stepsByPath[path] || [];
    setSteps(newSteps);
    if (newSteps.length === 0 && run) setRun(false);
  }, [window.location.pathname, run]);

  const startTutorial = () => {
    const path = window.location.pathname;
    const pageSteps = stepsByPath[path];
    if (!pageSteps || pageSteps.length === 0) {
      alert('No tutorial steps defined for this page.');
      return;
    }
    setSteps(pageSteps);
    setStepIndex(0);
    setRun(true);
  };

  const handleJoyrideEvent = (data) => {
    const { type, action, index, status } = data;
    if (type === EVENTS.TOUR_END || type === EVENTS.TOUR_STOP) {
      setRun(false);
      setStepIndex(0);
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const newIndex = index + (action === ACTIONS.NEXT ? 1 : -1);
      setStepIndex(newIndex);
    }
  };

  return (
    <TutorialContext.Provider value={{ startTutorial }}>
      {children}
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showSkipButton
        scrollToFirstStep
        disableBeacon={false}
        disableOverlay={false}
        floaterProps={{
          options: {
            offset: 10,
          },
        }}
        onEvent={handleJoyrideEvent}
        locale={{ last: 'Done' }}
        styles={{
          options: {
            primaryColor: '#a1ff14',
            textColor: '#e5e7eb',
            backgroundColor: 'rgba(17,24,39,0.95)',
            arrowColor: '#a1ff14',
          },
          tooltip: {
            backgroundColor: 'rgba(17,24,39,0.95)',
            border: '1px solid #a1ff14',
            borderRadius: '0.75rem',
            color: '#e5e7eb',
            fontSize: '14px',
          },
          buttonNext: { backgroundColor: '#a1ff14', color: '#000', fontSize: '14px' },
          buttonBack: { color: '#a1ff14', fontSize: '14px' },
          buttonSkip: { color: '#a1ff14', fontSize: '14px' },
        }}
      />
    </TutorialContext.Provider>
  );
};