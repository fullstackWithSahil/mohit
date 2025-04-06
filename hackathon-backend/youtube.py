# youtube.py
youtube_api_key="AIzaSyDPbsNFVLgMRMKWr2APoPek2ZWwzShqL6E"
from googleapiclient.discovery import build

# Replace with your YouTube Data API v3 key
API_KEY = youtube_api_key
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

# i want this function to return a list of top 5 videos with their title,thumbnail,url and all the comments on the video
def get_video_data(query, max_results=10):
    youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=API_KEY)
    
    try:
        # Search for videos - add videoDuration=long to filter out shorts
        search_response = youtube.search().list(
            q=query,
            part="id,snippet",
            maxResults=max_results * 2,  # Request more than needed to account for filtering
            type="video",
            videoDuration="medium"  # Filter for long videos only
        ).execute()
        
        video_data = []
        
        for item in search_response.get("items", []):
            # Make sure videoId exists before accessing
            if "videoId" not in item.get("id", {}):
                continue
                
            video_id = item["id"]["videoId"]
            
            # Get video details (title, likes, views)
            video_details_response = youtube.videos().list(
                part="snippet,statistics,contentDetails",
                id=video_id
            ).execute()
            
            if not video_details_response.get("items"):
                continue
                
            video_details = video_details_response.get("items", [])[0]
            
            # Get duration and skip if it's a short video
            duration = video_details.get("contentDetails", {}).get("duration", "")
            
            # Skip videos with duration less than 5 minutes
            # YouTube returns duration in ISO 8601 format (PT#M#S)
            if "PT" in duration and "M" not in duration:
                continue  # Skip videos with no minutes (less than 1 minute)
            
            title = video_details["snippet"]["title"]
            likes = int(video_details["statistics"].get("likeCount", 0))
            views = int(video_details["statistics"].get("viewCount", 0))
            
            # Get thumbnail
            thumbnails = video_details["snippet"].get("thumbnails", {})
            thumbnail_url = thumbnails.get("high", {}).get("url") or thumbnails.get("default", {}).get("url", "")
            
            # Get video URL
            video_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # Get comments
            comments = []
            try:
                comment_response = youtube.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    maxResults=100,
                    textFormat="plainText"
                ).execute()
                
                for comment in comment_response.get("items", []):
                    comment_text = comment["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                    comments.append(comment_text)
                    
            except Exception as e:
                print(f"Could not fetch comments for video ID {video_id}: {e}")
            
            # Append data with added thumbnail and URL fields
            video_data.append({
                "title": title,
                "thumbnail": thumbnail_url,
                "url": video_url,
                "likes": likes,
                "comments": comments,
                "views": views,
                "duration": duration  # Including duration in the response
            })
            
            # Stop once we have enough videos
            if len(video_data) >= max_results:
                break
        
        return video_data
        
    except Exception as e:
        # Catch and re-raise the exception with more context
        raise Exception(f"Error fetching YouTube data: {str(e)}")