import praw

def get_reddit_posts(query,max_results=10):
    # Initialize Reddit client
    reddit = praw.Reddit(
        client_id="N_AYBLNuIny9RAncTdyxjw",
        client_secret="esVg7rYM7cNKfBJg985ayjXaHgRKkA",
        password="sahil114",
        user_agent=True,
        username="FaithlessnessOwn1553",
    )

    # Search for posts
    subreddit_name = "all"
    subreddit = reddit.subreddit(subreddit_name)
    posts = subreddit.search(query, sort="top", limit=max_results)

    # Collect results
    results = []
    for post in posts:
        post.comments.replace_more(limit=0)  # Prevent "More comments"
            
        comments = [
            comment.body
            for comment in post.comments
            if isinstance(comment, praw.models.Comment)  # Filter only comment objects
        ]

        results.append({
            "title": post.title,
            "url": post.url,
            "comments": comments,
        })

    return results
