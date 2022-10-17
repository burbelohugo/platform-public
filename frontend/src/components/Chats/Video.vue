<template>
  <div class="box">
    <div class="roomTitle">
      <span v-if="loading"> Loading... {{roomName}}</span>
      <span v-else-if="!loading && roomName"> Connected to {{roomName}}</span>
      <span v-else>Did not connect to room successfully</span>
    </div>
    <div class="row remote_video_container">
      <div id="remoteTrack"></div>
    </div>
    <div class="spacing"></div>
    <div class="row">
      <div id="localTrack"></div>
    </div>
  </div>
</template>

<script>
// TODO: VIDEO DOES NOT GO AWAY WHEN LEAVING PAGE (HACKER AND SPONSOR)
// TODO: Update code to support twilio-video 2.x.x
import Twilio, { createLocalVideoTrack } from 'twilio-video';
import Axios from 'axios';
import generalMixin from '../../mixins/general';

const jwt = require('jsonwebtoken');

export default {
  name: 'Video',
  mixins: [generalMixin],
  data() {
    return {
      loading: false,
      data: {},
      localTrack: false,
      remoteTrack: '',
      activeRoom: '',
      previewTracks: '',
      identity: '',
      roomName: this.givenRoomName,
    };
  },
  props: {
    email: String,
    givenRoomName: String,
  },
  mounted() {
    this.createChat(this.roomName);
    // When a user is about to transition away from this page,
    // disconnect from the room, if joined.
    window.addEventListener('beforeunload', this.leaveRoomIfJoined);
  },
  methods: {
    async getAccessToken() {
      return Axios.get(`${this.getEnvVariable('BACKEND')}/chats/token`, {
        headers: {
          Authorization: `Bearer ${jwt.sign({ email: this.email }, 'technica')}`,
        },
      });
    },
    // Attach the Tracks to the DOM.
    attachTracks(tracks, container) {
      tracks.forEach((track) => {
        container.appendChild(track.attach());
      });
    },
    // Attach the Participant's Tracks to the DOM.
    attachParticipantTracks(participant, container) {
      const tracks = Array.from(participant.tracks.values());
      this.attachTracks(tracks, container);
    },
    // Detach the Tracks from the DOM.
    detachTracks(tracks) {
      tracks.forEach((track) => {
        track.detach().forEach((detachedElement) => {
          detachedElement.remove();
        });
      });
    },
    // Detach the Participant's Tracks from the DOM.
    detachParticipantTracks(participant) {
      const tracks = Array.from(participant.tracks.values());
      this.detachTracks(tracks);
    },
    // Leave Room.

    // TODO: Actually disconnect user when they click "Leave Meeting" or when they leave the screen... Currently to turn off the video / audio they must refresh page
    leaveRoomIfJoined() {
      if (this.activeRoom) {
        this.activeRoom.disconnect();
        // console.log('Disconnected from room');

        this.activeRoom.localParticipant.audioTracks.forEach((track) => {
          track.disable();
          track.stop();
          const attachedElements = track.detach();
          attachedElements.forEach((element) => element.remove());
          this.activeRoom.localParticipant.unpublishTrack(track);
        });
        this.activeRoom.localParticipant.videoTracks.forEach((track) => {
          track.disable();
          track.stop();
          const attachedElements = track.detach();
          attachedElements.forEach((element) => element.remove());
          this.activeRoom.localParticipant.unpublishTrack(track);
        });
      }
    },
    createChat(roomName) {
      this.loading = true;
      // console.log(roomName)
      this.performGetRequest(this.getEnvVariable('BACKEND'), 'chats/token').then((response) => {
        this.roomName = null;
        const { token } = response;
        const connectOptions = {
          name: roomName,
          // logLevel: 'debug',
          audio: true,
          video: { width: 600 },
        };
          // before a user enters a new room,
          // disconnect the user from they joined already
        this.leaveRoomIfJoined();

        // remove any remote track when joining a new room
        document.getElementById('remoteTrack').innerHTML = '';
        Twilio.connect(token, connectOptions).then((room) => {
          // set active toom
          this.activeRoom = room;
          this.roomName = roomName;
          this.loading = false;

          // Attach the Tracks of the Room's Participants.
          room.participants.forEach((participant) => {
            // console.log(participant);
            const previewContainer = document.getElementById('remoteTrack');
            this.attachParticipantTracks(participant, previewContainer);
          });
          // When a Participant joins the Room, log the event.
          room.on('participantConnected', (participant) => {
            // console.log(`Joining: '${participant.identity}'`);
          });
          // When a Participant adds a Track, attach it to the DOM.
          room.on('trackAdded', (track, participant) => {
            // console.log(`${participant.identity} added track: ${track.kind}`);
            const previewContainer = document.getElementById('remoteTrack');
            this.attachTracks([track], previewContainer);
          });
          // When a Participant removes a Track, detach it from the DOM.
          room.on('trackRemoved', (track, participant) => {
            // console.log(`${participant.identity} removed track: ${track.kind}`);
            this.detachTracks([track]);
          });
          // When a Participant leaves the Room, detach its Tracks.
          room.on('participantDisconnected', (participant) => {
            // console.log(`Participant '${participant.identity}' left the room`);
            this.detachParticipantTracks(participant);
          });
          room.on('disconnected', (x) => {
            // Detach the local media elements
            // console.log('Local participant disconnected');
            x.localParticipant.tracks.forEach((track) => {
              track.stop();
              const attachedElements = track.detach();
              attachedElements.forEach((element) => element.remove());
              this.activeRoom.localParticipant.unpublishTrack(track);
            });
          });
          // if local preview is not active, create it
          if (!this.localTrack) {
            createLocalVideoTrack().then((track) => {
              const localMediaContainer = document.getElementById('localTrack');
              localMediaContainer.appendChild(track.attach());
              this.localTrack = true;
            });
          }
        });
      });
    },
  },
};
</script>

<style >
  .remote_video_container {
    left: 0;
    margin: 0;
    border: 1px solid rgb(124, 129, 124);
  }
  #localTrack video {
      border: 3px solid rgb(124, 129, 124);
      margin: 0px;
      max-width: 50% !important;
      background-repeat: no-repeat;
  }
  .spacing {
    padding: 20px;
    width: 100%;
  }
  .roomTitle {
      border: 1px solid rgb(124, 129, 124);
      padding: 4px;
      color: dodgerblue;
  }
</style>
