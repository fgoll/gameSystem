# coding: utf-8
from common import conn, log, redis_conn, Status, RoomStatus, singleton, game_types, def_icon
import copy
import random


total_room = 10


def get_w_key(client):
    return 'w_id:%s' % str(id(client))


def get_user_key(u_id):
    return 'user:%s' % str(u_id)


def get_room_key(room_id):
    return 'room:%s' % str(room_id)


def say(client, message, clients, header):
    user = UserTool.current_user(client)
    user['message'] = message
    Packet(header=header, data=user, msg=None).write_message_to(clients=clients)


def gm_say(message, clients=None, client=None):
    packet = Packet(header='rooms.message', data={'rolename': 'GM', 'message': message},
                    msg=None)
    if client is not None:
        packet.write_message_to(client)
    else:
        packet.write_message_to(clients=clients)


def privacy_user(user, client):
    if 'password' in user:
        del user['password']
    u_id = redis_conn.get(get_w_key(client))
    user.update(redis_conn.hgetall(get_user_key(u_id)))
    if 'topic' in user:
        user['topic'] = eval(user['topic'])
    return user


@singleton
class Packet(object):

    def __init__(self, header, data, msg):
        self.header = header
        self.data = data
        self.msg = msg

    def write_message_to(self, client=None, clients=None):

        message = dict(header=self.header, data=self.data, msg=self.msg)

        log(message)

        if client:
            client.write_message(message)
        elif clients:
            if isinstance(clients, dict):
                for c in clients.values():
                    if UserTool.is_login(c):
                        c.write_message(message)
            elif isinstance(clients, list):
                for c in clients:
                    if UserTool.is_login(c):
                        c.write_message(message)


# user tool
class UserTool(object):

    @staticmethod
    def login(client, clients, username, password):

        reason = dict(result=False, msg='')

        datas = conn.get('select id from users where username="%s" and password="%s"' % (username, password))
        if datas:
            u_id, w_id = datas['id'], str(id(client))
            user_key = get_user_key(u_id)

            # if redis does not exist explain user don't online
            old_wid = redis_conn.hget(user_key, 'w_id')

            if old_wid:
                logout_client = clients.get(old_wid, None)

                if logout_client:
                    Packet(header='login.betop', data=None, msg=None).write_message_to(logout_client)
                    UserTool.quit(logout_client, clients)

            # record online user
            redis_conn.hmset(user_key, {
                'u_id': u_id,  # user id
                'w_id': w_id,  # websocket id
                'r_id': -1,  # room
                'p_id': -1,  # position
                'status': Status.free,
                'topic': None
            })
            # associated webSocket and user
            redis_conn.set(get_w_key(client), u_id)

            reason['msg'] = 'login success'
            reason['result'] = True

        elif conn.get('select id from users where username="%s"' % username):
            reason['msg'] = 'password error'
        else:
            reason['msg'] = 'user does not exist'
        return reason

    @staticmethod
    def register(username, password, role_name, icon):
        if icon == '':
            icon = def_icon
        reason = dict(result=False, msg='')
        if conn.get('select id from users where username="%s"' % username):
            reason['msg'] = 'user already exist'
        else:
            cmd = 'insert into users (username, password) values("%s", "%s")' % (username, password)
            key_id = conn.execute(cmd)
            cmd = 'insert into user_info (u_id, rolename, avatar, sex) values("%s", "%s", "%s", %d)' % (
                   key_id, role_name, icon, random.randint(0, 1))
            conn.execute(cmd)
            reason['result'] = True
            reason['msg'] = 'register success'
        return reason

    @staticmethod
    def is_login(client):
        result = True if redis_conn.get(get_w_key(client)) else False
        return result

    @staticmethod
    def quit(client, clients):

        room = RoomTool.leave_room(client)

        user = UserTool.current_user(client)
        w_key = get_w_key(client)
        u_id = redis_conn.get(w_key)
        u_key = get_user_key(u_id)

        if w_key is None or u_key is None:
            return None

        redis_conn.delete(w_key)
        redis_conn.delete(u_key)

        del clients[str(id(client))]

        if user:
            Packet(header='user.leave', data=user, msg=None).write_message_to(clients=clients)
        if room:
            Packet(header='rooms.info', data=room, msg=None).write_message_to(clients=clients)

    @staticmethod
    def toggle(client):
        user = UserTool.current_user(client)
        status = Status.ready
        if user['status'] == Status.ready:
            status = Status.waiting
        return UserTool.update_user(client, status=status)

    @staticmethod
    def update_user(client, r_id=None, p_id=None, status=None, topic=None):
        u_id = redis_conn.get(get_w_key(client))
        u_key = get_user_key(u_id)

        if r_id is not None:
            redis_conn.hset(u_key, 'r_id', r_id)
        if p_id is not None:
            redis_conn.hset(u_key, 'p_id', p_id)
        if status is not None:
            redis_conn.hset(u_key, 'status', status)
        if topic is not None:
            redis_conn.hset(u_key, 'topic', topic)

        return UserTool.current_user(client)

    @staticmethod
    def current_user(client):
        u_id = redis_conn.get(get_w_key(client))
        user_info = conn.get('select rolename, sex, avatar from user_info where u_id="%s"' % u_id)
        if user_info:
            return privacy_user(user_info, client)
        else:
            return privacy_user(dict(), client)

    @staticmethod
    def current_users(client, clients):
        users = list()
        for other in clients:
            if other == client:
                continue
            user = UserTool.current_user(other)
            if user:
                users.append(user)

        return users

    @staticmethod
    def room_users(room_id):

        return eval(redis_conn.hget(get_room_key(room_id), 'users'))


# room tool
class RoomTool(object):
    @staticmethod
    def init_rooms():
        for i in range(0, total_room):
            rand_type = random.randint(0, len(game_types) - 1)
            room = {
                'r_id': i,
                'users': [None, None, None, None, None, None],
                'status': RoomStatus.free,
                'cantip': False,
                'game_type': game_types[rand_type]
            }
            redis_conn.hmset(get_room_key(i), room)

    @staticmethod
    def update_room(room_id, users='', status='', cantip=''):
        if users is not '':
            redis_conn.hset(get_room_key(room_id), 'users', users)
        if status is not '':
            redis_conn.hset(get_room_key(room_id), 'status', status)
        if cantip is not '':
            redis_conn.hset(get_room_key(room_id), 'cantip', cantip)

        return RoomTool.room_by(room_id)

    @staticmethod
    def rooms():
        room_list = list()
        for i in range(0, total_room):
            room = redis_conn.hgetall(get_room_key(i))
            room['users'] = eval(room['users'])
            room_list.append(room)
        return room_list

    @staticmethod
    def room_clients(clients, room_id):
        users = eval(redis_conn.hget(get_room_key(room_id), 'users'))

        return map(lambda u: u is not None and clients[u['w_id']], users)

    @staticmethod
    def room_by(room_id):
        room = redis_conn.hgetall(get_room_key(room_id))
        room['users'] = eval(room['users'])
        return room

    @staticmethod
    def enter_room(client, room_id, p_id):

        if room_id == -1:
            room_id = 0
            for room in RoomTool.rooms():
                users_count = len(filter(lambda x: x is not None, room['users']))
                if users_count > 0:
                    room_id = room['r_id']
                    break

        users = UserTool.room_users(room_id)
        UserTool.update_user(client, r_id=room_id, status=Status.waiting)
        if p_id != -1:
            user = UserTool.update_user(client, p_id=p_id)
            users[p_id] = user
        else:
            for i in range(0, len(users)):
                if not users[i]:
                    user = UserTool.update_user(client, p_id=i)
                    users[i] = user
                    break
        room = RoomTool.update_room(room_id, users=users)

        return room

    @staticmethod
    def change_position(client, room_id, op_id, p_id):
        users = UserTool.room_users(room_id)
        if users[p_id] is None:
            user = UserTool.update_user(client, p_id=p_id)
            users[op_id] = None
            users[p_id] = user
            room = RoomTool.update_room(room_id, users=users)
            return room
        return None

    @staticmethod
    def leave_room(client, room_id=None, p_id=None):
        if room_id is None or p_id is None:
            user = UserTool.current_user(client)

            room_id, p_id = int(user.get('r_id', -1)), int(user.get('p_id', -1))
            if room_id == -1 or p_id == -1:
                return None

        users = UserTool.room_users(room_id)
        users[int(p_id)] = None

        RoomTool.update_room(room_id, users=users)
        RoomTool.update_room(room_id, status=RoomStatus.free)

        UserTool.update_user(client, r_id=-1, p_id=-1, status=Status.free)

        return RoomTool.room_by(room_id)

    @staticmethod
    def toggle(client):
        user = UserTool.toggle(client)

        room_id, p_id = int(user['r_id']), int(user['p_id'])

        users = UserTool.room_users(room_id)
        users[p_id] = user
        room = RoomTool.update_room(room_id, users=users)

        is_begin = False

        if room['game_type'] == 'draw':
            users_filter = filter(lambda x: x is not None, users)
            if len(users_filter) > 1:
                ready_users = filter(lambda x: x['status'] == Status.ready, users_filter)
                if len(users_filter) == len(ready_users):
                    is_begin = True
                    RoomTool.update_room(room_id, status=RoomStatus.playing)
        elif room['game_type'] == 'chess':
            mid = len(users) / 2
            army_one = users[:mid]
            army_two = users[mid:]
            ready_one = filter(lambda x: x['status'] == Status.ready, filter(lambda x: x is not None, army_one))
            ready_two = filter(lambda x: x['status'] == Status.ready, filter(lambda x: x is not None, army_two))
            total_user = filter(lambda x: x is not None, users)

            if (len(ready_one) > 0 and len(ready_two) > 0) and len(ready_one) == len(
                    ready_two) and ready_one + ready_two == total_user:
                is_begin = True
                RoomTool.update_room(room_id, status=RoomStatus.playing)
        return {
            'room': RoomTool.room_by(room_id),
            'begin': is_begin
        }

    @staticmethod
    def game_over(clients, room_id):
        users = UserTool.room_users(room_id)

        for client in clients:
            if client:
                user = UserTool.update_user(client, topic=None, status=Status.waiting)
                p_id = int(user['p_id'])
                users[p_id] = user

        return RoomTool.update_room(room_id, status=RoomStatus.ready, users=users)


class TopicTool(object):
    @staticmethod
    def get_topics():
        return [
            {
                'topic_title': u'布娃娃',
                'tips': [
                    '三个字',
                    '儿童玩具'
                ]
            },
            {
                'topic_title': u'不入虎穴焉得虎子',
                'tips': [
                    '八个字',
                    '俗语'
                ]
            },
            {
                'topic_title': u'寻花问柳',
                'tips': [
                    '四个字',
                    '成语'
                ]
            },
            {
                'topic_title': u'酒鬼',
                'tips': [
                    '两个字',
                    '形容一个人的嗜好'
                ]
            },
            {
                'topic_title': u'死不瞑目',
                'tips': [
                    '成语',
                    '一种表情'
                ]
            },
            {
                'topic_title': u'色眯眯',
                'tips': [
                    '三个字',
                    '形容一种表情'
                ]
            }
        ]
