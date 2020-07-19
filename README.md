# tPlace 
[![Build Status](https://travis-ci.org/Tancho-Welcome-Week/tPlace.svg?branch=master)](https://travis-ci.org/Tancho-Welcome-Week/tPlace)

Link to Google Doc: https://docs.google.com/document/d/1rtCWr6h_V5rW4PW9A89pC6WUaZYYxDM0FjZsCx6NeT4/edit?ts=5ee7828a

tPlace is a recreation of Reddit's r/place for Tembusu Welcome Week 2020.

Tech Stack (tentative) - PostgreSQL, Docker, Express, Socket.io, Redis, Vanilla JS, Node

# Using Docker:

Docker is a useful tool in development. When using Docker, you do not need to download Redis or PostgreSQL separately on your machine. With `docker-compose`, you can run multiple services at once, streamlining the otherwise cumbersome testing process.

1. Download Docker Desktop (if your OS allows for it) from https://docs.docker.com/docker-for-windows/install/ (Windows Pro), https://docs.docker.com/docker-for-windows/install-windows-home/ (Windows Home), or https://docs.docker.com/docker-for-mac/install/ (Mac).
2. Create an account at Docker Hub (https://hub.docker.com/)
3. Click the whale icon and login
4. _(Optional)_ open Settings
5. _(Optional)_ In 'WSL Integration' under 'Resources', enable integration with additional WSL distros (e.g. Ubuntu) if you want to use said distros
6. Navigate to the src folder using Terminal/a WSL2 client
7. Run `docker-compose up --build`
8. After testing the environment, terminate the build gracefully with ^C
9. Run `docker-compose down`. This will remove all the containers from your machine

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
