import { useEffect, useState } from "react";
import axios from "axios";

export default function CommunityList() {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const url = "https://31330b9b-30e1-49d0-a994-e29bc7e7c6b7-00-3toa7yx0y1d12.sisko.replit.dev";

    // Array of beautiful gradient backgrounds
    const backgroundGradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        'linear-gradient(135deg, #ffeef8 0%, #c6e2ff 100%)',
        'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)'
    ];

    // Community icons for different types
    const communityIcons = ['🏘️', '🌆', '🏞️', '🏙️', '🌳', '🏖️', '⛰️', '🌲', '🏡', '🌸', '🏰', '🗼'];

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get(`${url}/neighbour/community`);
                setCommunities(response.data.communities);
            } catch (err) {
                console.error("Error fetching communities:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
                <p className="loading-text">Discovering amazing communities...</p>
            </div>
        );
    }

    return (
        <>
            <div className="community-list-container">
                <div className="header-section">
                    <h1 className="main-title">
                        <span className="title-icon">🌟</span>
                        Community Discovery
                    </h1>
                    <p className="subtitle">
                        Find your perfect neighborhood and connect with amazing neighbors
                    </p>
                </div>

                <div className="communities-grid">
                    {communities.map((community, idx) => (
                        <div
                            key={idx}
                            className="community-card"
                            style={{
                                background: backgroundGradients[idx % backgroundGradients.length]
                            }}
                        >
                            <div className="card-overlay"></div>
                            <div className="card-content">
                                <div className="card-header">
                                    <div className="community-icon">
                                        {communityIcons[idx % communityIcons.length]}
                                    </div>
                                    <div className="card-badge">
                                        <span className="badge-icon">👥</span>
                                        <span className="badge-text">
                                            {community.no_residents} resident{community.no_residents !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <h3 className="community-name">
                                        {community.community_name}
                                    </h3>
                                    <p className="community-description">
                                        {community.community_description || "A wonderful community waiting to welcome new neighbors."}
                                    </p>
                                </div>

                                <div className="card-footer">
                                    <button className="join-btn">
                                        <span>Join Community</span>
                                        <span className="btn-arrow">→</span>
                                    </button>
                                    <button className="info-btn">
                                        <span>ℹ️</span>
                                    </button>
                                </div>
                            </div>

                            <div className="card-decoration">
                                <div className="decoration-circle circle-1"></div>
                                <div className="decoration-circle circle-2"></div>
                                <div className="decoration-circle circle-3"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {communities.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🏘️</div>
                        <h3 className="empty-title">No Communities Found</h3>
                        <p className="empty-description">
                            Be the first to create a community in your neighborhood!
                        </p>
                        <button className="create-btn">
                            <span>Create Community</span>
                            <span className="btn-icon">✨</span>
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .community-list-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 2rem;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    gap: 2rem;
                }

                .loading-spinner {
                    position: relative;
                }

                .spinner {
                    width: 60px;
                    height: 60px;
                    border: 3px solid rgba(79, 172, 254, 0.1);
                    border-top: 3px solid #4facfe;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-text {
                    font-size: 1.1rem;
                    color: #667eea;
                    font-weight: 500;
                    margin: 0;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 3rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .main-title {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }

                .title-icon {
                    font-size: 2.2rem;
                    animation: sparkle 2s ease-in-out infinite;
                }

                @keyframes sparkle {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.1) rotate(5deg); }
                }

                .subtitle {
                    font-size: 1.2rem;
                    color: #718096;
                    margin: 0;
                    line-height: 1.6;
                }

                .communities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .community-card {
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    min-height: 280px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }

                .community-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                }

                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(1px);
                    z-index: 1;
                }

                .card-content {
                    position: relative;
                    z-index: 2;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    padding: 1.5rem;
                    color: white;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }

                .community-icon {
                    font-size: 2.5rem;
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }

                .card-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    padding: 6px 12px;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .badge-icon {
                    font-size: 1rem;
                }

                .card-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .community-name {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin: 0;
                    line-height: 1.3;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .community-description {
                    font-size: 0.95rem;
                    line-height: 1.5;
                    opacity: 0.95;
                    margin: 0;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                .card-footer {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1rem;
                }

                .join-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #2d3748;
                    border: none;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .join-btn:hover {
                    background: white;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }

                .btn-arrow {
                    transition: transform 0.3s ease;
                }

                .join-btn:hover .btn-arrow {
                    transform: translateX(3px);
                }

                .info-btn {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                    font-size: 1.1rem;
                }

                .info-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

                .card-decoration {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    pointer-events: none;
                    z-index: 1;
                }

                .decoration-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                }

                .circle-1 {
                    width: 60px;
                    height: 60px;
                    top: -30px;
                    right: -30px;
                    animation: pulse 3s ease-in-out infinite;
                }

                .circle-2 {
                    width: 40px;
                    height: 40px;
                    top: 20px;
                    right: 10px;
                    animation: pulse 3s ease-in-out infinite 1s;
                }

                .circle-3 {
                    width: 20px;
                    height: 20px;
                    top: 60px;
                    right: 40px;
                    animation: pulse 3s ease-in-out infinite 2s;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.1; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1.5rem;
                    opacity: 0.7;
                }

                .empty-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin-bottom: 1rem;
                }

                .empty-description {
                    font-size: 1.1rem;
                    color: #718096;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }

                .create-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
                }

                .create-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(79, 172, 254, 0.4);
                }

                .btn-icon {
                    transition: transform 0.3s ease;
                }

                .create-btn:hover .btn-icon {
                    transform: rotate(180deg);
                }

                @media (max-width: 768px) {
                    .community-list-container {
                        padding: 1rem;
                    }

                    .communities-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .main-title {
                        font-size: 2rem;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .subtitle {
                        font-size: 1rem;
                    }

                    .community-card {
                        min-height: 250px;
                    }

                    .card-content {
                        padding: 1.25rem;
                    }
                }

                @media (max-width: 480px) {
                    .header-section {
                        margin-bottom: 2rem;
                    }

                    .main-title {
                        font-size: 1.75rem;
                    }

                    .community-name {
                        font-size: 1.2rem;
                    }

                    .community-description {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </>
    );
} 