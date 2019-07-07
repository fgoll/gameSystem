
const getters = {
  fd: state => state.user.fd,
  user: state => state.user,

  hallUsers: state => state.hall.users, // 所有用户
  hallMessages: state => state.hall.messages, // 大厅的所有信息
};


export default getters;
