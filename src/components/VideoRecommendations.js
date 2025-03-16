import React, { useState, useEffect } from 'react';
import { fetchYouTubeRecommendations } from '../youtubeService';

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
        <div>
            <h3>Recommended Videos for {symptom}</h3>
            <div>
                {videos.map(video => (
                    <iframe
                        key={video.id.videoId}
                        width="600"
                        height="335"
                        src={`https://www.youtube.com/embed/${video.id.videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                ))}
            </div>
        </div>
    );
}

export default VideoRecommendations;
