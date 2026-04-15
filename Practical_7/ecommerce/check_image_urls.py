import urllib.request

urls = [
    'https://via.placeholder.com/300x200?text=Laptop',
    'https://via.placeholder.com/300x200?text=Phone',
    'https://via.placeholder.com/300x200?text=Headphones',
]

for url in urls:
    try:
        res = urllib.request.urlopen(url, timeout=10)
        print(url, res.status, res.getheader('Content-Type'))
    except Exception as exc:
        print('ERROR', url, exc)
