
const getters = {
  fd: state => state.user.fd,
  user: state => state.user,

  hallRooms: state => state.hall.rooms,
  hallRoomsMap: state => state.hall.roomsMap,
  hallUsers: state => state.hall.users, // 所有用户
  hallMessages: state => state.hall.messages, // 大厅的所有信息

  roomDuration: state => state.room.duration, // 倒计时
  roomMessages: state => state.room.messages,
};


export default getters;
