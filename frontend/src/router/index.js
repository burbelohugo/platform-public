import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Config from '../config/general';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    displayInNavBar: true,
  },
  {
    path: '/expo-schedule',
    name: 'Expo',
    component: () => import('../views/ExpoSchedule.vue'),
    displayInNavBar: new Date() > new Date(Config.shared.STOP_HACKING_DATE),
  },
  {
    path: '/event',
    name: 'Event',
    component: () => import('../views/Event.vue'),
    displayInNavBar: false,
  },
  {
    path: '/sponsors',
    name: 'Sponsors',
    component: () => import('../views/Sponsors.vue'),
    displayInNavBar: true,
  },
  {
    path: '/sponsor',
    name: 'Sponsor Booth',
    component: () => import('../views/SponsorBooth.vue'),
    displayInNavBar: false,
  },
  {
    path: '/sponsor-analytics',
    name: 'Sponsor Booth Analytics',
    component: () => import('../views/SponsorAnalytics.vue'),
    displayInNavBar: false,
  },
  {
    path: '/live-stream',
    name: 'Live Stream',
    beforeEnter() {
      window.open(Config.shared.LIVESTREAM_LINK, '_blank');
    },
  },
  {
    path: '/devpost',
    name: 'Devpost',
    displayInNavBar: false,
    beforeEnter() {
      window.open(Config.prd.PRIZES_LINK, '_blank');
    },
  },
  {
    path: '/profile',
    name: 'My Profile',
    component: () => import('../views/HackerProfile.vue'),
    displayInNavBar: false,
  },
  {
    path: '/resources',
    name: 'Hacker Resources',
    component: () => import('../views/HackerResources.vue'),
    displayInNavBar: false,
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('../views/Schedule.vue'),
    displayInNavBar: true,
  },
  {
    path: '/login/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    displayInNavBar: false,
    props: true,
  },
  {
    path: '/project',
    name: 'Project',
    component: () => import('../views/Project.vue'),
    displayInNavBar: false,
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('../views/Team.vue'),
    displayInNavBar: false,
  },
  // {
  //   path: '/team-room',
  //   name: 'Team Room',
  //   component: () => import('../views/TeamRoom.vue'),
  //   displayInNavBar: false,
  // },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    displayInNavBar: false,
  },
  {
    path: '/help-desk',
    name: 'Help Desk',
    component: () => import('../views/HelpDesk.vue'),
    displayInNavBar: false,
  },
  // {
  //   path: '/watercooler',
  //   name: 'WaterCooler',
  //   component: () => import('../views/WaterCooler.vue'),
  //   displayInNavBar: false,
  // },
  // {
  //   path: '/slack',
  //   name: 'Slack',
  //   displayInNavBar: false,
  //   beforeEnter() {
  //     window.open(Config.shared.SLACK_INVITE_LINK, '_blank');
  //   },
  // },
  {
    path: '/join-team/:team',
    name: 'Join Team',
    displayInNavBar: false,
    component: () => import('../views/JoinTeam.vue'),
  },
  {
    path: '/profiles',
    name: 'View Profiles',
    component: () => import('../views/ViewProfiles.vue'),
    displayInNavBar: false,
    beforeEnter: (to, from, next) => {
      if (Vue.cookie.get('group') !== 'sponsor') next({ name: '404' });
      else next();
    },
  },
  {
    path: '/request-mentor',
    name: 'Request A Mentor',
    component: () => import('../views/RequestMentor.vue'),
    displayInNavBar: false,
  },
  {
    path: '/faq',
    name: 'FAQ',
    displayInNavBar: false,
    beforeEnter() {
      window.open(Config.shared.FAQ_LINK, '_blank');
    },
  },
  {
    path: '/slack',
    name: 'Slack',
    displayInNavBar: false,
    beforeEnter() {
      window.open(Config.prd.SLACK_WORKSPACE_LINK, '_blank');
    },
  },
  {
    path: '/maps',
    name: 'Maps',
    displayInNavBar: false,
    component: () => import('../views/Maps.vue'),
  },
  {
    path: '/campfire-games',
    name: 'Campfire Games',
    component: () => import('../views/CampfireGames.vue'),
    displayInNavBar: false,
  },
  {
    path: '/speed-chatting',
    name: 'Speed Chatting',
    component: () => import('../speed-chatting/Welcome.vue'),
    // Will fix real conditional when sean is done finalizing it
    // displayInNavBar: new Date() > new Date(Config.shared.STOP_HACKING_DATE),
    displayInNavBar: (new Date() > new Date(Config.shared.SPEED_CHATTING_START)) && (new Date() < new Date(Config.shared.SPEED_CHATTING_STOP)),
  },
  {
    path: '/speed-chatting/lobby',
    name: 'Speed Chatting Queue',
    component: () => import('../speed-chatting/Lobby.vue'),
    displayInNavBar: false,
  },
  {
    path: '/speed-chatting/room',
    name: 'Speed Chatting Video Chat',
    component: () => import('../speed-chatting/VideoChatRoom.vue'),
    props: (route) => ({ email: route.query.email, room_name: route.query.room_name }),
    displayInNavBar: false,
  },
  {
    path: '/speed-chatting/thanks',
    name: 'Speed Chatting End',
    component: () => import('../speed-chatting/Thanks.vue'),
    displayInNavBar: false,
  },
  {
    path: '/social',
    name: 'Social Page',
    component: () => import('../views/Social.vue'),
  },
  {
    path: '/gallery',
    name: 'Project Gallery',
    component: () => import('../views/Gallery.vue'),
  },
  {
    path: '/galleryDetails',
    name: 'Gallery Details',
    component: () => import('../views/GalleryDetails.vue'),
  },
  {
    path: '/team',
    name: 'Hack',
    displayInNavBar: true,
  },
  {
    path: '/social',
    name: 'Social',
    displayInNavBar: true,
    // dropdown: [
    //   {
    //     path: '/social',
    //     name: 'Socialize',
    //   },
    //   {
    //     path: '/slack',
    //     name: 'Slack',
    //   },
    //   {
    //     path: '/games',
    //     name: 'Games',
    //   },
    //   {
    //     path: '/watercooler',
    //     name: 'WaterCooler',
    //   },
    //   {
    //     path: '/speed-chatting',
    //     name: 'Speed Chatting',
    //   },
    // ],
  },
  {
    path: '/profile',
    name: 'Profile',
    displayInNavBar: true,
  },
  {
    path: '/help',
    name: 'Help',
    displayInNavBar: true,
    dropdown: [
      {
        path: '/help-desk',
        name: 'Help Desk',
      },
      {
        path: '/request-mentor',
        name: 'Request A Mentor',
      },
      // {
      //   path: '/resources',
      //   name: 'Hacker Resources',
      // },
    ],
  },
  {
    path: '/links',
    name: 'Links',
    displayInNavBar: true,
    dropdown: [
      {
        path: '/live-stream',
        name: 'Live Stream',
      },
      {
        path: '/maps',
        name: 'In-Person Maps',
      },
      {
        path: '/faq',
        name: 'FAQ',
      },
      {
        path: '/devpost',
        name: 'Devpost'
      },
      {
        path: '/slack',
        name: 'Slack'
      },
      {
        path: '/logout',
        name: 'Logout'
      },
    ],
  },
  {
    path: '/404',
    name: '404',
    component: () => import('../views/HTTP404.vue'),
    displayInNavBar: false,
  },
  {
    path: '/in-person',
    name: 'In-Person',
    component: () => import('../views/InPerson.vue'),
    displayInNavBar: false,
  },
  {
    path: '/authenticate',
    name: 'Authenticate',
    component: () => import('../views/Authenticate.vue'),
    displayInNavBar: false,
  },
  {
    path: '/logout',
    component: () => import('../views/Logout.vue'),
    displayInNavBar: false,
  },
  { 
    path: '/Loading',
    name: 'Loading',
    component: () => import('../views/Loading.vue'),
    displayInNavBar: false,
  },
  {
    path: '/:shortlink',
    component: () => import('../views/ShortLink.vue'),
    displayInNavBar: false,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.params.shortlink) {
    next();
  } else if ((!Vue.cookie.get('userId')) && (!(['Login', 'Authenticate', 'Event'].includes(to.name)))) {
    const tryingToJoinTeam = to.name === 'Join Team';
    next({ name: 'Login', params: { tryingToJoinTeam } });
  } else if (!Vue.cookie.get('registered') && (!['Login', 'Authenticate', 'Event', 'Register', 'Loading'].includes(to.name))) {
    next({ name: 'Register' });
  } else if (Vue.cookie.get('snap') !== null && Vue.cookie.get('snap') && !['Login', 'Authenticate', 'Loading', 'Register', 'logout'].includes(to.name)) {
    next({ name: 'Loading' });
  } else {
    next();
  }
});

export default router;
