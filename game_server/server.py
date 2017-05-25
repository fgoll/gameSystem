# coding: utf-8
import tornado.httpserver
import tornado.web
import tornado.websocket
import tornado.ioloop
from common import log
from handler.game_handler import GameMessageHanlder
import json
from tool import RoomTool


class GameHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self, *args, **kwargs):
        self.application.handler.clients[str(id(self))] = self

    def on_close(self):
        self.application.handler.quit(self)

    def on_message(self, message):
        packet = json.loads(message)
        self.application.handler.handle(self, packet)


class GameApplication(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r'/', GameHandler),
        ]

        self.handler = GameMessageHanlder()

        # init all rooms
        RoomTool.init_rooms()

        super(GameApplication, self).__init__(handlers)


def main():
    http = tornado.httpserver.HTTPServer(GameApplication())
    http.listen(8888)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == '__main__':
    main()
