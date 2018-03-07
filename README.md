## gameSystem
a python and vue gamesystem project for drawguess(你画我猜) and gobang(五子棋)

## demo: [gamesystem link](http://111.230.174.196:8383/)
test account:
    - username: zsh    password: 123
    - username: zyl    password: 123

## Installation
- install redis 
- install mysql
- install python module
    - tornado 
    - torndb (dependency MySQLdb)
    - redis 
- install npm 

## Usage

- `cd game_vue` and use 1.`npm install` and 2.`npm run dev` to start vue project
- create mysql database and named partyplay, next import sql.sql to partyplay;
- `cd game_server` and `vim common.py` to change password for Mysql connect:
```python
conn = torndb.Connection(host='127.0.0.1',
                         database='partyplay',
                         user='root',
                         password='******', ) # need change to your password
```
- start redis server and `cd game_server` and use `python server.py` to start server

## screenshot
![hall](./screenshot/screenshot1.png)

![drawguess](./screenshot/screenshot2.png)

![chess](./screenshot/screenshot3.png)


