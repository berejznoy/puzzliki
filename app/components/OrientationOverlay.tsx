'use client';

import { useState, useEffect } from 'react';

export default function OrientationOverlay() {
    const [isMounted, setIsMounted] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const checkOrientation = () => {
            const isMobile = window.innerWidth < 768;
            const isPortrait = window.innerHeight > window.innerWidth;
            setShowOverlay(isMobile && isPortrait);
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, []);

    // Don't render during SSR or before mounting
    if (!isMounted || !showOverlay) return null;

    return (
        <div className="orientation-overlay">
            <div className="orientation-content">
                <div className="phone-icon">📱</div>
                <h2>Поверните устройство</h2>
                <p>Для удобной игры переверните телефон горизонтально</p>
                <div className="rotate-arrow">↻</div>
            </div>
        </div>
    );
}
