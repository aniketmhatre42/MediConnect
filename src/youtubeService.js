import axios from 'axios';

const API_KEY = 'AIzaSyAKlTOimxiUY4mCFlulFLmXFYlt5x6TOr8'; 

export async function fetchYouTubeRecommendations(searchQuery) {
    const maxResults = 6; 

    const query = `${searchQuery} treatment videos in hindi`;
    const URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}&maxResults=${maxResults}&relevanceLanguage=mr`;

    try {
        const response = await axios.get(URL);
        return response.data.items; 
    } catch (error) {
        console.error("Error fetching YouTube videos", error);
        return [];
    }
}
