# JWT-boilerplate

Backend (microservice) solution to handle JWT token through httponly cookies.

After registering or login user is created access and refresh token. 

Access token:
- expires after some time
- best way to refresh token is call user/token route before expiring from frontend (possible solution is write recursive function with setTimeout)
- on client is stored in httponly cookie


Refresh token:
- is saved in db
- db record contains date of last manipulation (refreshed after every succesfull authentication) and token is erased several days after that date
- on client is stored in httponly cookie

Register function creates new user in database, set access and refresh token cookie and send user data and access token expiration in json to frontend where you should handle access token refreshing.

Login is similar to register without creating new user in database.

Logout function reset cookies and delete refresh token from database.

Refres token function can be used for silent login. If there is a valid refresh token cookie on client browser, user is logged in same way like login/register function do.

Authentication function middleware checks if valid access token is present in user browser.


I'll be glad for all remarks
