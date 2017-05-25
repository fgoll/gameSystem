# coding: utf-8
from tool import UserTool, RoomTool, Packet, TopicTool, say, gm_say
from common import Status, RoomStatus


class DrawHandler(object):
    def __int__(self):
        pass

    @staticmethod
    def begin(room, clients):
        r_id = int(room['r_id'])
        room_clients = RoomTool.room_clients(clients, r_id)
        room_user = DrawHandler.begin_game(room_clients, r_id, True)
        room, current_user, other_clients = room_user['room'], room_user['user'], room_user['other_clients']

        Packet(header='rooms.begin', data=room, msg=None).write_message_to(clients=clients)
        gm_say(u'游戏开始啦, 由 %s 先开始' % current_user['rolename'], room_clients)
        DrawHandler.send_tips(current_user, other_clients)

    @staticmethod
    def begin_game(clients, room_id, is_first=False):
        users = UserTool.room_users(room_id)
        current_user = None
        index = 0
        flag = False
        next_flag = False

        for client, topic in zip(clients, TopicTool.get_topics()):
            if client:
                if is_first:
                    user = UserTool.update_user(client, topic=topic, status=Status.playing)
                else:
                    user = UserTool.current_user(client)
                if is_first and index == 0:
                    user = UserTool.update_user(client, status=Status.action)
                    current_user = user
                elif next_flag:
                    user = UserTool.update_user(client, status=Status.action)
                    current_user = user
                    flag = True
                    next_flag = False
                elif not is_first and not flag and user['status'] == Status.action:
                    user = UserTool.update_user(client, status=Status.playing)
                    next_flag = True
                p_id = int(user['p_id'])
                users[p_id] = user

            index += 1

        other_clients = []
        for client in clients:
            if client:
                user = UserTool.current_user(client)
                if user['status'] != Status.action:
                    other_clients.append(client)

        over = False
        if not is_first and not flag:  # game over
            over = True
            for client in clients:
                if client:
                    user = UserTool.update_user(client, topic=None, status=Status.waiting)
                    p_id = int(user['p_id'])
                    users[p_id] = user
            RoomTool.update_room(room_id, status=RoomStatus.ready)
        return {
            'room': RoomTool.update_room(room_id, users=users),
            'user': current_user,
            'over': over,
            'other_clients': other_clients
        }

    @staticmethod
    def draw_start(data, client, clients):
        color, weight = data.get('color', None), data.get('weight', None)

        other_clients = filter(lambda u: id(u) != id(client),
                               RoomTool.room_clients(clients, UserTool.current_user(client)['r_id']))

        Packet(header='draw.begin', data={'color': color, 'weight': weight}, msg=None). \
            write_message_to(clients=other_clients)

    @staticmethod
    def draw_move(data, client, clients):
        x, y, width, height, r_id = (data.get('x', None), data.get('y', None), data.get('width', None),
                                     data.get('height', None), data.get('room_id', None))
        other_clients = filter(lambda u: id(u) != id(client),
                               RoomTool.room_clients(clients, r_id))
        x_r, y_r = float(x) / width, float(y) / height
        Packet(header='draw.move', data={'x': x_r, 'y': y_r}, msg=None).write_message_to(clients=other_clients)

    @staticmethod
    def draw_end(client, clients):
        other_clients = filter(lambda u: id(u) != id(client),
                               RoomTool.room_clients(clients, UserTool.current_user(client)['r_id']))
        Packet(header='draw.end', data=None, msg=None).write_message_to(clients=other_clients)

    @staticmethod
    def draw_clear(client, clients):
        other_clients = filter(lambda u: id(u) != id(client),
                               RoomTool.room_clients(clients, UserTool.current_user(client)['r_id']))
        Packet(header='draw.clear', data=None, msg=None).write_message_to(clients=other_clients)

    @staticmethod
    def next_begin(client, clients):
        r_id = UserTool.current_user(client)['r_id']
        room_clients = RoomTool.room_clients(clients, r_id)
        games = DrawHandler.begin_game(room_clients, r_id)
        room, current_user, over, other_clients = games['room'], games['user'], games['over'], games['other_clients']

        RoomTool.update_room(r_id, cantip=False)

        if over:
            Packet(header='rooms.info', data=room, msg=None).write_message_to(clients=clients)
            gm_say('本局游戏结束啦', room_clients)
        else:
            Packet(header='rooms.next', data=room, msg=None).write_message_to(clients=clients)
            gm_say(u'接下去由 %s 作画' % current_user['rolename'], room_clients)

            DrawHandler.send_tips(current_user, other_clients)

    @staticmethod
    def send_tips(current_user, other_clients):
        tips = current_user['topic']['tips']
        for tip in tips:
            gm_say('偷偷给你个提示: %s' % tip, other_clients)

    @staticmethod
    def judge(client, clients, topic, user, message):
        if DrawHandler.judge_draw_result(topic, message):
            # self.next_begin()
            Packet(header='rooms.willnext', data=10, msg=None).write_message_to(clients=clients)
            gm_say(u'%s 猜对啦, 时间调整为10秒' % user['rolename'], clients)
        else:
            say(client, message, clients, 'rooms.message')

    @staticmethod
    def judge_draw_result(topic, message):
        topic_title = topic['topic_title']

        if topic_title == message:
            return True
        return False

    @staticmethod
    def current_topic(r_id):

        room = RoomTool.room_by(r_id)

        if room['status'] != RoomStatus.playing:
            return None

        users = UserTool.room_users(r_id)

        for user in users:
            if user:
                if user.get('status', None) == Status.action:
                    return user['topic']

        return None
