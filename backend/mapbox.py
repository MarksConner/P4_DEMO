import requests
import os

MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN")

def get_directions(origin, destination):
    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{origin};{destination}?access_token={MAPBOX_TOKEN}"
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    data = r.json()
    return data

def geocode(query):
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json?access_token={MAPBOX_TOKEN}"
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.json()