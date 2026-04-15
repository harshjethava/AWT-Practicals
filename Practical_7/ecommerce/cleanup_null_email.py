from pymongo import MongoClient

uri = 'mongodb+srv://event_db_user:bNYOSecXiecvNKjp@ecommerce.ktpdms6.mongodb.net/user_Data?appName=Ecommerce'
client = MongoClient(uri)
db = client['user_Data']
users = db['users']

total = users.count_documents({})
null_email = users.count_documents({'email': None})
missing_email = users.count_documents({'email': {'$exists': False}})
print('count total', total)
print('count null email', null_email)
print('count missing email', missing_email)

result = users.delete_many({'email': None})
print('deleted null email docs', result.deleted_count)
print('after null email', users.count_documents({'email': None}))
