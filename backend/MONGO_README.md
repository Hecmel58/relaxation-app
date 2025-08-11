MongoDB Atlas (free tier) setup
------------------------------
1. Go to https://www.mongodb.com/cloud/atlas and create a free cluster.
2. Create a database user and whitelist your IP (or allow 0.0.0.0/0 for testing).
3. Get the connection string (it will look like mongodb+srv://<user>:<pass>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority).
4. Set MONGO_URI to that connection string in backend/.env and optionally set MONGO_DBNAME.
5. Start the backend and it will use MongoDB for persistence.

Environment variables (backend/.env):
- PORT=4000
- JWT_SECRET=change_this_secret
- JWT_EXPIRES_IN=7d
- MONGO_URI=<your mongodb connection string>
- MONGO_DBNAME=relaxation_db
