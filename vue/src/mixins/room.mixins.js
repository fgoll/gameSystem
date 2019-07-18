import { mapGetters } from 'vuex';
import {
  say, leave, toggle,
} from '@/pack/send/room';

export default {
  data() {
    return {
      message: '',
    };
  },
  computed: {
    ...mapGetters([
      'user',
      'hallRoomsMap',
      'roomDuration',
      'roomMessages',
    ]),

    room() {
      return this.hallRoomsMap[this.user.roomId].room;
    },

    roomUser() {
      const { users } = this.room;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user && user.u_id === this.user.id) {
          return user;
        }
      }

      return null;
    },

    actionUser() {
      const { users } = this.room;

      for (let i = 0, n = users.length; i < n; i++) {
        const user = users[i];
        if (user && user.status === 'action') {
          return user;
        }
      }

      return null;
    },

    canAction() {
      return this.roomUser.status === 'action';
    },
  },

  watch: {
    roomMessages() {
      const dom = this.$refs.chat;
      if (dom.scrollTop === dom.scrollHeight - dom.clientHeight) {
        this.$nextTick(() => {
          dom.scrollTop = dom.scrollHeight;
        });
      }
    },

    room(val) {
      if (val.status === 'playing') {
        window.onresize();
      }
    },
  },

  methods: {
    leave() {
      if (this.room.status === 'playing') {
        this.$message.error(this.$t('status.playing'));
        return;
      }
      leave({
        room_id: this.user.roomId,
      });
    },
    say() {
      if (this.message) {
        say({
          message: this.message,
          room_id: this.user.roomId,
        });
        this.message = '';
      }
    },
    toggle() {
      if (this.room.status === 'playing') {
        this.$message.error(this.$t('status.playing'));
        return;
      }

      toggle();
    },
  },
};
