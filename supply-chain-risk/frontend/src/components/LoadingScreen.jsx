import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="clerk-loading-screen">
            <div className="clerk-loading-inner">
                <div className="clerk-loading-spinner" />
                <p>Loading SupplyShield...</p>
            </div>
        </div>
    );
}
