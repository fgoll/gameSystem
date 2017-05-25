# coding: utf-8
from common import log, Status
from tool import UserTool, RoomTool, Packet, say, gm_say
import time
import threading
from draw_handler import DrawHandler
from chess_handler import ChessHandler


class GameMessageHanlder:

    def __init__(self):
        self.clients = dict()
        self.client = None
        self.draw_handler = DrawHandler()
        self.chess_handler = ChessHandler()

    def invalid(self):
        pass

    def quit(self, client):
        if UserTool.is_login(client):
            UserTool.quit(client, self.clients)

    def handle(self, client, packet):

        self.client = client

        try:
            method = getattr(self, packet['header'])
            (method(packet['data']) if 'data' in packet else method()) if method else self.invalid()
        except AttributeError as e:
            log(e)

    # handle common operation
    def login(self, data):
        username = data.get('username', None)
        password = data.get('password', None)
        results = UserTool.login(self.client, self.clients, username, password)
        current_users, user = UserTool.current_users(self.client, self.clients.values()), UserTool.current_user(self.client)
        result, msg = results['result'], results['msg']

        if result:
            # init room

            Packet(header='login.success', data=user, msg=msg).write_message_to(self.client)
            Packet(header='user.enter', data=user, msg=None).write_message_to(clients=self.clients)
            if len(current_users) > 0:
                Packet(header='user.all', data=current_users, msg=None).write_message_to(self.client)
            Packet(header='rooms.init', data=RoomTool.rooms(), msg=None).write_message_to(self.client)
        else:
            Packet(header='login.error', data=None, msg=msg).write_message_to(self.client)

    def register(self, data):

        username, password, role_name, icon = data.get('username', None), data.get('password', None), data.get(
            'rolename', None), data.get('icon', None).encode("ascii")
        log(data)
        reason = UserTool.register(username, password, role_name, icon)
        result, msg = reason['result'], reason['msg']
        Packet(header='register.success', data=None, msg=msg).write_message_to(self.client) if result else Packet(
            header='register.error', data=None, msg=msg).write_message_to(self.client)

    def enter_room(self, data):
        room_id, p_id = data.get('room_id', None), data.get('p_id', None)

        # 1 get room
        room = RoomTool.enter_room(self.client, room_id, p_id)

        room_id = room["r_id"]

        Packet(header='rooms.info', data=room, msg=None).write_message_to(clients=self.clients)
        Packet(header='rooms.enter', data=room_id, msg=None).write_message_to(self.client)

        if room['game_type'] == 'draw':
            gm_say('欢迎来到聚会玩, 该房间将开启的游戏是 - 你画我猜', client=self.client)
        elif room['game_type'] == 'chess':
            gm_say('欢迎来到聚会玩, 该房间将开启的游戏是 - 五子棋', client=self.client)
            gm_say('游戏规则 - 上方为白色方 下方为黑色方, 黑色方先出棋, 黑色方选手下完轮到白色方, 如此交替进行', client=self.client)
        else:
            gm_say('欢迎来到聚会玩, 该房间将开启的游戏是 - UNO棋牌', client=self.client)
            gm_say('游戏规则 - ')

    def leave(self, data):
        room_id, p_id = data.get('room_id', None), data.get('p_id', None)

        room = RoomTool.leave_room(self.client, room_id, p_id)
        Packet(header='rooms.leave', data=None, msg=None).write_message_to(self.client)
        Packet(header='rooms.info', data=room, msg=None).write_message_to(clients=self.clients)

    def say_hall(self, data):
        log(data)
        message = data.get('message', None)
        say(self.client, message, self.clients, 'hall.message')

    def say_room(self, data):
        message, r_id = data.get('message', None), data.get('room_id', None)
        clients = RoomTool.room_clients(self.clients, r_id)

        topic = self.draw_handler.current_topic(r_id)

        user = UserTool.current_user(self.client)

        if topic is not None:
            self.draw_handler.judge(self.client, self.clients, topic, user, message)
        else:
            say(self.client, message, clients, 'rooms.message')

    def toggle(self):
        result = RoomTool.toggle(self.client)
        room, is_begin = result['room'], result['begin']

        room_type = room['game_type']

        Packet(header='rooms.info', data=room, msg=None).write_message_to(clients=self.clients)
        if is_begin:
            if room_type == 'draw':
                self.draw_handler.begin(room, self.clients)
            elif room_type == 'chess':
                self.chess_handler.begin(room, self.clients)

    def next_begin(self, data):
        room_id = data.get('room_id', None)
        game_type = RoomTool.room_by(room_id)['game_type']
        if game_type == 'draw':
            self.draw_handler.next_begin(self.client, self.clients)
        elif game_type == 'chess':
            self.chess_handler.next_begin(self.client, self.clients)

    def change_position(self, data):
        room_id, op_id, p_id = data.get('room_id', None), data.get('op_id', None), data.get('p_id', None)
        try:
            op_id, p_id = int(op_id), int(p_id)
            room = RoomTool.change_position(self.client, room_id, op_id, p_id)
            if room is not None:
                Packet(header='rooms.info', data=room, msg=None).write_message_to(clients=self.clients)
        except TypeError as e:
            log(e)

    # handle drawing game
    def draw_start(self, data):
        self.draw_handler.draw_start(data, self.client, self.clients)

    def draw_move(self, data):
        self.draw_handler.draw_move(data, self.client, self.clients)

    def draw_end(self):
        self.draw_handler.draw_end(self.client, self.clients)

    def draw_clear(self):
        self.draw_handler.draw_clear(self.client, self.clients)

    # handle chess game
    def chess_down(self, data):
        i, j, army_type = data.get('i', None), data.get('j', None), data.get('army', None)
        self.chess_handler.chess_down(self.client, self.clients, i, j, army_type)

    def chess_win(self, data):
        i, j, army_type = data.get('i', None), data.get('j', None), data.get('army', None)
        self.chess_handler.chess_win(self.client, self.clients, i, j, army_type)