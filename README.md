# tPlace

Link to Google Doc: https://docs.google.com/document/d/1rtCWr6h_V5rW4PW9A89pC6WUaZYYxDM0FjZsCx6NeT4/edit?ts=5ee7828a

tPlace is a recreation of Reddit's r/place for Tembusu Welcome Week 2020.

Tech Stack (tentative) - PostgreSQL, Docker, Express, Socket.io, Redis, Vanilla JS, Node




# Using Redis:

1. Download Redis using either https://redis.io/topics/quickstart (Linux, maybe Mac also) or https://redislabs.com/blog/redis-on-windows-10/ (Windows). For file access via WSL on Windows, refer to https://www.tenforums.com/tutorials/127857-access-wsl-linux-files-windows-10-a.html.
2. NOTE: The redis server must be started via `sudo service redis-server start` before `redis-cli` is invoked. Otherwise, the CLI will be stuck in a loop of `not connected>` commands. If you get stuck, use Ctrl-C to exit.
