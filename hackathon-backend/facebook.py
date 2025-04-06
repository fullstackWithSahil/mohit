from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.api import FacebookAdsApi

# Replace these with your actual credentials
ACCESS_TOKEN = '1768417790664366|0KqqfwEGA00OK_7_6Z7ixvCCuHM'
# ad_account_id = 'act_1768417790664366'  # Ad Account ID in the format "act_<ID>"
ad_account_id = 'EAAZAIXdo6Hq4BO9chV37YOyrWTtZA328FOZAHgE5wWNRhBgA53xBsTIDkweuuof8z86lXk8hpTidnIC8OYaGsSUXrvrFHFuiBxUQB3ZBKBfynX5fDU2XMc4ZAIm6CjyC0YytAWl79EZCQkmQ4TCMhWORD7TUVbqXOZBJ7ATcD0ZCXmaqw2RL3aFB0a7fcIZAejl9FCXv2p5QmZCAnuPTG9QgZDZD'  # Ad Account ID in the format "act_<ID>"
FacebookAdsApi.init(access_token=ACCESS_TOKEN)

def get_facebook_ads(query, limit=5):
    """
    Fetch ads related to a specific query, including hooks, CTAs, and descriptions.

    :param query: The search query to filter ads.
    :param ad_account_id: The Facebook Ad Account ID.
    :param limit: Number of ads to fetch (default is 10).
    :return: List of ads with hooks, CTAs, and descriptions matching the query.
    """
    try:
        ad_account = AdAccount(ad_account_id)
        ads = ad_account.get_ads(
            fields=[
                'name',  # Ad name (hook)
                'adcreatives',  # Ad creative details
                'effective_object_story_id',
                'status',
            ],
            params={'limit': limit}
        )

        ads_data = []

        for ad in ads:
            creative = ad.get('adcreatives', {})
            hooks = ad.get('name', 'No hook available')
            description = creative.get('body', 'No description available')
            cta = creative.get('call_to_action_type', 'No CTA available')

            # Filter ads based on the search query in hooks or description
            if query.lower() in hooks.lower() or query.lower() in description.lower():
                ads_data.append({
                    'hook': hooks,
                    'description': description,
                    'CTA': cta,
                })

        return ads_data

    except Exception as e:
        print(f"An error occurred: {e}")
        return []

# Example usage
# if __name__ == "__main__":
#     search_query = "marketing"  # Replace with your desired query
#     ads_data = get_facebook_ads(search_query, limit=5)
#     for ad in ads_data:
#         print(ad)
