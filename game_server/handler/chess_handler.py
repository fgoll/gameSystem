# coding: utf-8
from tool import UserTool, RoomTool, Packet, say, gm_say, get_room_key
from common import Status, log, redis_conn
import time
import threading


class ChessHandler(object):
    def __init__(self):
        pass

    @staticmethod
    def begin(room, clients):
        r_id = int(room['r_id'])
        room_clients = RoomTool.room_clients(clients, r_id)
        games = ChessHandler.begin_game(room_clients, r_id, True)
        room, current_user, begin_client = games['room'], games['user'], games['begin_client']

        Packet(header='rooms.begin', data=room, msg=None).write_message_to(clients=clients)
        gm_say(u'游戏开始啦, 由黑色方 %s 先出手' % current_user['rolename'], room_clients)
        if begin_client:
            Packet(header='rooms.turned', data=room, msg=None).write_message_to(begin_client)

    @staticmethod
    def begin_game(clients, room_id, is_first=False):
        users = UserTool.room_users(room_id)

        current_user = None
        index = 0
        flag = False
        next_flag = False

        # 1 2       =>   2 1
        # 1 2 3 4   =>   3 1 4 2                0  2  4
        # 1 2 3 4 5 6 => 4 1 5 2 6 3        4 1 2 3 5 6    4 1 5 2 3 6
        seq_clients = []

        fil_clients = filter(lambda x: x, clients)

        mid = len(fil_clients) / 2

        is_black = True

        dict_clients = dict()

        for i in range(0, len(fil_clients)):
            dict_clients[i] = fil_clients[i]

        print dict_clients
        while len(filter(lambda x: x, dict_clients.values())) > 0:
            # print filter(lambda x: x, dict_clients.values())

            for key in dict_clients.keys():
                print type(key)
                if is_black and key >= mid and dict_clients[key] is not None:
                    seq_clients.append(dict_clients[key])
                    dict_clients[key] = None
                    print dict_clients
                    is_black = False
                    break
                if not is_black and key < mid and dict_clients[key] is not None:
                    seq_clients.append(dict_clients[key])
                    dict_clients[key] = None
                    is_black = True
                    break
            # print 1111

        print seq_clients
        for client in seq_clients:
            if client:
                if is_first:
                    user = UserTool.update_user(client, status=Status.playing)
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
                    print index

                p_id = int(user['p_id'])
                users[p_id] = user

            index += 1

        # over = False
        if not is_first and not flag:  # game over
            # over = True

            for client in seq_clients:

                if client:
                    user = UserTool.update_user(client, status=Status.action)
                    current_user = user
                    break

            try:
                p_id = int(user.get('p_id', None))
                users[p_id] = user
            except TypeError as e:
                pass

        begin_client = None

        other_clients = []
        index = 0
        for client in clients:
            if client:
                user = UserTool.current_user(client)
                if user['status'] != Status.action:
                    other_clients.append(client)
                else:
                    begin_client = client
                    action_army = u'白色方' if index < mid else u'黑色方'
            index += 1
        return {
            'room': RoomTool.update_room(room_id, users=users),
            'user': current_user,
            'army': action_army,
            'begin_client': begin_client
        }

    @staticmethod
    def next_begin(client, clients):
        r_id = UserTool.current_user(client)['r_id']
        room_clients = RoomTool.room_clients(clients, r_id)
        games = ChessHandler.begin_game(room_clients, r_id)
        room, current_user, army, begin_client = games['room'], games['user'], games['army'], games['begin_client']

        # RoomTool.update_room(r_id, cantip=False)

        Packet(header='rooms.next', data=room, msg=None).write_message_to(clients=clients)
        gm_say(u'接下去由%s %s 出手' % (army, current_user['rolename']), room_clients)
        if begin_client is not None:
            Packet(header='rooms.turned', data=None, msg=None).write_message_to(begin_client)

    @staticmethod
    def chess_down(client, clients, i, j, army_type):
        other_client = filter(lambda u: id(u) != id(client),
                              RoomTool.room_clients(clients, UserTool.current_user(client)['r_id']))
        Packet(header='chess.down', data={'i': i, 'j': j, 'army_type': army_type}, msg=None).write_message_to(
            clients=other_client)

        ChessHandler.next_begin(client, clients)

    @staticmethod
    def chess_win(client, clients, i, j, army_type):
        room_id = UserTool.current_user(client)['r_id']
        room_clients = RoomTool.room_clients(clients, room_id)
        other_client = filter(lambda u: id(u) != id(client),
                              room_clients)
        Packet(header='chess.down', data={'i': i, 'j': j, 'army_type': army_type}, msg=None).write_message_to(
            clients=other_client)
        Packet(header='chess.over', data=None, msg=None).write_message_to(clients=room_clients)

        army = u'白色方' if army_type == 'white' else u'黑色方'
        gm_say(u'%s获胜啦 5s后游戏结束' % army, room_clients)

        def game_over():
            room = RoomTool.game_over(room_clients, room_id)
            time.sleep(5)
            Packet(header='rooms.info', data=room, msg=None).write_message_to(clients=clients)

        p = threading.Thread(target=game_over)
        p.start()