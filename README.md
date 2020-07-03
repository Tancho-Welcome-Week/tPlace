# tPlace

Link to Google Doc: https://docs.google.com/document/d/1rtCWr6h_V5rW4PW9A89pC6WUaZYYxDM0FjZsCx6NeT4/edit?ts=5ee7828a

tPlace is a recreation of Reddit's r/place for Tembusu Welcome Week 2020.

Tech Stack (tentative) - PostgreSQL, Docker, Express, Socket.io, Redis, Vanilla JS, Node




# Using Redis:

1. Download Redis using either https://redis.io/topics/quickstart (Linux, maybe Mac also) or 
 https://redislabs.com/blog/redis-on-windows-10/ (Windows). For file access via WSL on Windows, refer to
 https://www.tenforums.com/tutorials/127857-access-wsl-linux-files-windows-10-a.html.
2. Start up a Linux client and navigate to the directory where the files were extracted to.
3. Start the Redis server using `sudo service redis-server start`.
4. If exploring the server via the command line, use `redis-cli`. Take note that the server must be started before this
 command is used. Otherwise, the CLI will be stuck in a loop of `not connected>` commands. If you get stuck, 
 use Ctrl-C to exit.
5. Use the command `sudo service redis-server stop` to stop the server when necessary.
6. While the server is running, code can be run from the same machine, and it will communicate with the server. Take
note that the default IP is `localhost`, with port number `6379`. These parameters are located in the 
backend/redis_project package. In some cases, these parameters may not be valid if the port is already in use.
