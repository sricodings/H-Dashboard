import React, { useState, useEffect, useRef } from 'react';

const TOUR_STEPS = [
    {
        target: '.navbar-brand-logo',
        title: 'Welcome to Datalens',
        content: 'This is your mission control. Customize your workspace and generate insights instantly.',
        position: 'bottom'
    },
    {
        target: '.app-sidebar',
        title: 'Quick Navigation',
        content: 'Access your dashboard, configuration tools, and customer orders directly from here.',
        position: 'right'
    },
    {
        target: '#ai-fab-btn',
        title: 'Meet Your AI Assistant',
        content: 'Ask our AI to create charts, seed data, or analyze your performance in natural language.',
        position: 'left'
    },
    {
        target: '.theme-toggle',
        title: 'Theme Switching',
        content: 'Toggle between stunning dark and light modes for optimal viewing across any environment.',
        position: 'bottom'
    },
    {
        target: '.sidebar-nav-item i.bi-question-circle',
        title: 'Need Help?',
        content: 'Access documentation and resources anytime if you need a helping hand.',
        position: 'right'
    }
];

export default function OnboardingTour() {
    const [step, setStep] = useState(-1);
    const [spotlightStyle, setSpotlightStyle] = useState({});
    const [popoverStyle, setPopoverStyle] = useState({});
    
    useEffect(() => {
        const hasVisited = localStorage.getItem('datalens_onboarded');
        if (!hasVisited) {
            // Start after a slight delay for page components to settle
            const timer = setTimeout(() => setStep(0), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        if (step >= 0 && step < TOUR_STEPS.length) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            return () => window.removeEventListener('resize', updatePosition);
        }
    }, [step]);

    const updatePosition = () => {
        const currentData = TOUR_STEPS[step];
        if (!currentData) return;

        const targetEl = document.querySelector(currentData.target);
        if (!targetEl) {
            // If target isn't found (e.g., specific widget not loaded), skip or try next
            return;
        }

        const rect = targetEl.getBoundingClientRect();
        
        // Spotlight Style
        setSpotlightStyle({
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16
        });

        // Popover Style
        const padding = 20;
        let popTop = 0;
        let popLeft = 0;

        if (currentData.position === 'bottom') {
            popTop = rect.bottom + padding;
            popLeft = rect.left + (rect.width / 2) - 160;
        } else if (currentData.position === 'right') {
            popTop = rect.top;
            popLeft = rect.right + padding;
        } else if (currentData.position === 'left') {
            popTop = rect.top;
            popLeft = rect.left - 320 - padding;
        } else if (currentData.position === 'top') {
            popTop = rect.top - 200 - padding;
            popLeft = rect.left + (rect.width / 2) - 160;
        }

        // Keep inside viewport
        popLeft = Math.max(20, Math.min(popLeft, window.innerWidth - 340));
        popTop = Math.max(20, Math.min(popTop, window.innerHeight - 250));

        setPopoverStyle({
            top: popTop,
            left: popLeft
        });
    };

    const nextStep = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            finishTour();
        }
    };

    const finishTour = () => {
        localStorage.setItem('datalens_onboarded', 'true');
        setStep(-1);
    };

    if (step === -1) return null;

    const currentStepData = TOUR_STEPS[step];

    return (
        <>
            <div className="tour-overlay" onClick={finishTour} />
            <div className="tour-spotlight" style={spotlightStyle} />
            <div className="tour-popover" style={popoverStyle}>
                <h4>
                    <span className="tour-icon">✨</span>
                    {currentStepData.title}
                </h4>
                <p>{currentStepData.content}</p>
                <div className="tour-footer">
                    <div className="tour-steps-indicator">
                        Step {step + 1} of {TOUR_STEPS.length}
                    </div>
                    <div className="tour-actions">
                        <button className="btn-tour-skip" onClick={finishTour}>Skip Tour</button>
                        <button className="btn-tour-next" onClick={nextStep}>
                            {step === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
