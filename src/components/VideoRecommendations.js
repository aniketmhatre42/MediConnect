import React, { useState, useEffect } from 'react';
import { fetchYouTubeRecommendations } from '../youtubeService';
import '../styles/VideoRecommendations.css';

function VideoRecommendations({ symptom }) {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        async function getVideos() {
            const fetchedVideos = await fetchYouTubeRecommendations(symptom);
            setVideos(fetchedVideos); 
        }
        getVideos();
    }, [symptom]);

    return (
        <div className="video-recommendations-container">
            <h3 className="video-recommendations-title">Recommended Videos for {symptom}</h3>
            <div className="video-grid">
                {videos.map(video => (
                    <div key={video.id.videoId} className="video-card">
                        <div className="video-wrapper">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="video-info">
                            <h4>{video.snippet?.title || 'Video Title'}</h4>
                            <p>{video.snippet?.channelTitle || 'Channel'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VideoRecommendations;
