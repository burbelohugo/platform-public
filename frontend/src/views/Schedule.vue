<template>
  <div class="schedule-page">
    <div v-if="dataLoaded" class="schedule-list">
      <!--  -->

      <b-row class="mt-3" style="height: 90vh">
        <!-- FULL SCHEDULE -->
        <b-col md="9" class="pl-5 h-100">
          <b-card no-body class="bulletin h-100">
            <div class="column-card">
              <b-card-body class="schedule-card-header schedule-toggles">
                <!-- DAY FILTER -->
                <div>
                  <b-button-group size="lg" class="btn-group-outline">
                    <b-button
                      class="m-0 px-5 btn-group-btn"
                      v-for="day in days"
                      :class="{ 'btn-group-btn-active': day === selectedDay }"
                      :key="getDayOfTheWeek(day)"
                      @click="selectTitleItem(day)"
                    >
                      {{ getDayOfTheWeek(day) }}
                    </b-button>
                  </b-button-group>
                </div>

                <div>
                  <b-button-group size="lg" class="btn-group-outline mx-3">
                    <b-button
                      class="m-0 btn-group-btn"
                      v-bind:class="{ 'btn-group-btn-active': eventModeFilter === 'all' }"
                      @click="filterEventsByMode('all')"
                      >All Events</b-button
                    >
                    <b-button
                      class="m-0 btn-group-btn"
                      v-bind:class="{ 'btn-group-btn-active': eventModeFilter === 'inperson' }"
                      @click="filterEventsByMode('inperson')"
                      >In-Person</b-button
                    >
                    <b-button
                      class="m-0 btn-group-btn"
                      v-bind:class="{ 'btn-group-btn-active': eventModeFilter === 'online' }"
                      @click="filterEventsByMode('online')"
                      >Virtual</b-button
                    >
                  </b-button-group>
                </div>

                <div>
                  <b-dropdown class="tag-dropdown" toggle-class="m-0" variant='dropdown' size="lg" text="Filter">
                      <span
                        v-for="(tag, i) in tags"
                        :key="tag.text"
                        @click="selectTag(i)"
                        class="checklist"
                      >
                        <checklist-item :isChecked="tag.checked" :key="tag.checked" class="tag-checkbox-line">
                          <template v-slot:text>
                          {{ tag.text }}
                          </template>
                        </checklist-item>
                      </span>
                  </b-dropdown>
                </div>

              </b-card-body>

              <!-- LEGEND AND TIMEZONE -->
              <!-- <div style="text-align: left;" class="pl-2 pr-5 my-2">
        <b>Key: <span class="main-event-text">Main Events</span>,
          <span class="workshop-text">Workshops</span>,
          <span class="mini-event-text">Food and Mini-Events</span>,
          <span class="demo-text"> Demo Events</span>
        </b>
        <span style="float: right;">
          <b>Timezone:</b> {{ timezoneDisplayName }}
        </span>
      </div> -->

              <!-- SCHEDULE SCROLL -->
              <div class="list-wrapper">
                <div id="schedule-body" class="schedule-body">
                  <div class="schedule-time">
                    <div
                      v-for="timeWindow in displayTimeWindows"
                      :key="timeWindow"
                      class="timewindow"
                    >
                      {{ timeWindow }}
                      <div
                        v-if="
                          timeWindow === getScheduleTimeLineWindow &&
                          new Date().getDay() === selectedDay.getDay()
                        "
                        class="schedule-time-line"
                      >
                        <div class="schedule-time-line-header"></div>
                        <div class="schedule-time-line-inner"></div>
                      </div>
                    </div>
                  </div>
                  <div class="schedule-content">
                    <div
                      v-for="scheduleColumn in scheduleColumns"
                      :key="scheduleColumn"
                      class="schedule-column"
                    >
                      <div
                        v-for="timeWindow in displayTimeWindows"
                        :key="timeWindow"
                        class="timewindow"
                      >
                        <div
                          v-if="
                            formattedEvents[selectedDay][timeWindow].find(
                              (event) => event.column === scheduleColumn && event.display && event.displayMode
                            )
                          "
                          @click="openScheduleModal(selectedDay, timeWindow, scheduleColumn)"
                          class="schedule-content-item"
                          :class="
                            formattedEvents[selectedDay][timeWindow].find(
                              (event) => event.column === scheduleColumn
                            ).branding.class
                          "
                        >
                          <div class="schedule-content-item-title">
                            {{
                              formattedEvents[selectedDay][timeWindow].find(
                                (event) => event.column === scheduleColumn
                              ).event_name
                            }}
                          </div>
                          <div class="schedule-content-item-star">
                            <img
                              :src="
                                getFavoriteIconForEvent(
                                  formattedEvents[selectedDay][timeWindow].find(
                                    (event) => event.column === scheduleColumn
                                  )
                                )
                              "
                              @click.stop="
                                toggleEventInList(
                                  formattedEvents[selectedDay][timeWindow].find(
                                    (event) => event.column === scheduleColumn
                                  )
                                )
                              "
                              class="schedule-content-item-star-size"
                            />
                          </div>
                          <div class="schedule-content-item-horizons-icon">
                            <!-- TODO: Figure out what we're doing about Expand Your Horizons -->
                            <!-- <img
                      v-if="
                        formattedEvents[selectedDay][timeWindow].find(
                          (event) => event.column === scheduleColumn
                        ).display_horizons_icon
                      "
                      src="../assets/horizons_icon_white.svg"
                      style="width: 19px; height: 18px; margin-right: 0.5rem"
                    /> -->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-card>
        </b-col>

        <!-- FAVORITE/RECOMMENDED EVENTS -->
        <b-col md="3" class="pr-5 h-100">
          <b-card no-body class="bulletin h-100">
            <div class="column-card">
              <!-- <h4 class="section-title">Event Bulletin</h4> -->
              <b-card-body class="schedule-card-header">

                <b-button-group size="lg" class="btn-group-outline w-100">
                  <b-button
                    class="m-0 btn-group-btn"
                    v-bind:class="{ 'btn-group-btn-active': sidebarMode === 'saved' }"
                    @click="toggleEventSidebar('saved')"
                    >Saved Events</b-button
                  >
                  <b-button
                    class="m-0 btn-group-btn"
                    v-bind:class="{ 'btn-group-btn-active': sidebarMode === 'popular' }"
                    @click="toggleEventSidebar('popular')"
                    >Popular Events</b-button
                  >
                </b-button-group>
              </b-card-body>
              <div class="list-wrapper ">
                <EventList
                  @openScheduleModal="openScheduleModalDirect"
                  :rawEvents="getSidePanelEvents()"
                />
              </div>
            </div>
          </b-card>
        </b-col>
      </b-row>

      <!-- make computed method. if saved then just display the thing above. otherwise, render popular events -->
    </div>
    <LoadingSpinner v-else />
    <EventModal :selectedEvent="selectedEvent" :handleListToggle="toggleEventInList" />
    <EasterEgg
      :index="3"
      :hint="'We seriously need to make this harder. But before giving the next Techniclue, explore the different mini-events, workshops, and other events Technica has to offer! Ready now? Here is the next Techniclue: convert the following binary into ASCII to know where the next character is located: 01101000 01100001 01100011 01101011.'"
      :fileName="'scavenger-hunt/4.png'"
    />
  </div>
</template>

<script>
import ScheduleCarousel from "@/components/ScheduleCarousel.vue";
import EventList from "@/components/EventList";
import generalMixin from "../mixins/general";
import scheduleMixin from "../mixins/schedule";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import EventModal from "../components/EventModal.vue";
import EasterEgg from "../components/EasterEgg.vue";
import ChecklistItem from "../components/ChecklistItem.vue";

export default {
  name: "Schedule",
  mixins: [generalMixin, scheduleMixin],
  components: {
    LoadingSpinner,
    ScheduleCarousel,
    EventModal,
    EasterEgg,
    ChecklistItem,
    EventList,
  },
  data() {
    return {
      popularEvents: null,
      rawEvents: [],
      formattedEvents: {},
      eventsInUserList: this.getUserEvents(),
      selectedDay: null,
      tags: [],
      days: [],
      timeWindows: [],
      scheduleColumns: 5,
      dataLoaded: false,
      selectedEvent: {},
      startDate: new Date(this.getEnvVariable("START_DATE")),
      endDate: new Date(this.getEnvVariable("END_DATE")),
      targetEventId: null,
      sidebarMode: "saved",
      sidebarEvents: [],
      eventModeFilter: "all",
    };
  },
  async mounted() {
    this.targetEventId = this.$route.query.event;
    this.prepareTimeWindows();
    this.getPopularEvents();
    this.populateDays();
    [this.rawEvents] = await Promise.all([
      this.getData(this.getEnvVariable("BACKEND"), "schedule"),
      this.getEventsFromUserList(),
    ]);
    this.tags.push( { text: 'All Tags', checked: true } );
    this.processRawEvents();
    this.dataLoaded = true;
    if (this.targetEventId && this.rawEvents.find((event) => event.id === this.targetEventId)) {
      this.openScheduleModalDirect(this.rawEvents.find((event) => event.id === this.targetEventId));
    }
    this.activityTracking("SCHEDULE");
  },
  computed: {
    timezoneIsUSEastern() {
      const offset = new Date().getTimezoneOffset();
      return offset === 240; // 240 is the offset for us eastern time zone
    },
    displayTimeWindows() {
      const daySchedule = this.formattedEvents[this.selectedDay];
      const keys = Object.keys(this.formattedEvents[this.selectedDay]);
      const topExtraRows = 1;
      const bottomExtraRows = 4;
      let startCutoff = 0;
      let endCutoff = -1;
      // 1. trim at the top
      for (let i = 0; i < keys.length; i += 1) {
        if (daySchedule[keys[i]].length !== 0) {
          startCutoff = Math.max(i - topExtraRows, 0);
          break;
        }
      }

      // 2. trim at the bottom
      const newTimes = [];
      for (let i = keys.length - 1; i >= 0; i -= 1) {
        if (daySchedule[keys[i]].length !== 0) {
          /* Check for events that overflow the end of the time windows */
          endCutoff = i + bottomExtraRows;

          if (endCutoff >= this.timeWindows.length) {
            // Add additional time windows to the end to support long events (up to 1 hour over)
            const midnight = new Date();
            midnight.setHours(0, 0, 0, 0);
            const currentTime = new Date(midnight);

            // Go through every possible 30 minute increment in a day
            while (endCutoff >= keys.length + newTimes.length) {
              newTimes.push(this.formatAMPM(currentTime));
              currentTime.setMinutes(currentTime.getMinutes() + 30);
            }
          }
          break;
        }
      }

      return this.timeWindows.concat(newTimes).slice(startCutoff, endCutoff);
    },
    timezoneDisplayName() {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        // apply some light formatting to the time zone
        return tz.replace("_", " ");
      }
      // some browsers do not support this (e.g. IE11)
      return "";
    },
    eventIsLive() {
      // Returns if the event us currently happening
      const start = new Date(this.selectedEvent.start_time);
      const end = new Date(this.selectedEvent.end_time);
      const now = new Date();

      return start <= now && now <= end;
    },
  },
  methods: {
    getSidePanelEvents() {
      if (this.sidebarMode === 'popular') {
        return this.popularEvents;
      }
      else {
        return this.rawEvents.filter((event) => this.eventsInUserList.includes(event.id));
      }
    },
    toggleEventSidebar(clicked) {
      // console.log(clicked)
      this.sidebarMode = clicked;
    },
    filterEventsByMode(clicked) {
      this.eventModeFilter = clicked;
      this.selectMode(clicked);
    },
    async getUserEvents() {
      const userParams = {
        user_id: this.getUserId(),
      };
      return await this.performGetRequest(this.getEnvVariable('BACKEND'), 'schedule/user/event', userParams);
    },
    async getPopularEvents() {
      this.popularEvents = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'schedule/event/popular', {});
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.tag-dropdown {
  z-index: 1000;
}

.tag-checkbox-line {
  font-size: 1rem;
}

.schedule-card-header {
  background-color: var(--color-primary-muted);
  border: 3px solid var(--color-border);
  border-left: none;
  border-right: none;
  border-top: none;
}

.schedule-toggles {
  display: flex;
  /* justify-content: space-between; */
}

.btn-group-outline {
  background: none;
}

.btn-group-btn {
  border-radius: 8px;
  background: var(--color-primary-muted-muted) !important;
  color: var(--color-primary);
  border-color: var(--color-primary) !important;
}

.btn-group-btn:hover {
  background: var(--color-primary) !important;
  color: white;
  border-color: var(--color-primary) !important;
}

.btn-group-btn-active {
  background: var(--color-primary) !important;
  color: white;
}

.list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 1rem;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: -100;
}

.column-card {
  display: flex;
  height: 100%;
  flex-direction: column;
  min-height: 0;
}

.schedule-page {
  align-items: center;
}

.schedule-list-title-item {
  background: var(--color-foreground);
  box-sizing: border-box;
  border-radius: var(--border-radius);
  padding: 10px;
  font-style: normal;
  font-weight: 300;
  font-size: 24px;
  margin-right: 3px;
  border: 5px solid rgba(var(--color-primary-rgb), 0.5);
  color: rgba(var(--color-primary-rgb), 0.5);
  cursor: pointer;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.schedule-list-title-item-selected {
  border-color: var(--color-primary);
  box-shadow: 0px 4px 4px rgba(var(--color-primary-rgb), 0.25);
  color: var(--color-primary);
}

.schedule-body {
  background: var(--color-foreground);
  border-radius: 8px;
  height: fit-content;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}

.schedule-time {
  display: flex;
  flex-flow: column;
  width: 15%;
}

.schedule-content {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
}

.timewindow {
  font-size: 1.25rem;
  line-height: 7.5vh;
  height: 7.5vh;
  border-top: 3px solid var(--color-light-border);
}

.schedule-column {
  width: 20%;
  max-width: 30%;
  flex-wrap: wrap;
}

.schedule-content-item {
  height: 4.5vh;
  border-radius: 8px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  width: 90%;
  padding: 2%;
  font-size: 18px;
  cursor: pointer;
  position: relative;
  padding-top: 0.5rem;
  line-height: 20px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-light-text);
  /* opacity: 70%; */
}

.length-30-min,
.length-45-min {
  font-size: 16px;
}

.schedule-content-item-star {
  width: fit-content;
  padding-right: .25rem;
}

.schedule-content-item-star-size {
  width: 19px; 
  height: 18px;
}

.schedule-content-item-horizons-icon {
  width: fit-content;
}

.schedule-content-item-title {
  flex-grow: 1;
  text-align: start;
  padding-left: 1rem;
  margin-right: 2rem;
  max-width: 80%;
  min-width: 80%;
}

.schedule-time-line {
  width: 60vw;
  position: absolute;
  height: 2px;
  margin-left: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.schedule-time-line-inner {
  width: 100%;
  border: 1px solid rgba(var(--color-primary-rgb), 0.8);
}

.schedule-time-line-header {
  border-radius: 50%;
  padding: 8px;
  background-color: rgba(var(--color-primary-rgb), 0.8);
  border: 1px solid rgba(var(--color-primary-rgb), 0.8);
}

.event-passed {
  opacity: 0.5;
}

.length-30-min {
  height: 7vh !important;
}

.length-45-min {
  height: 11.5vh !important;
}

.length-60-min {
  height: 14.5vh !important;
}

.length-75-min {
  height: 11vh !important;
}

.length-90-min {
  height: 22vh !important;
}

.length-120-min {
  height: 29.5vh !important;
}

.length-150-min {
  height: 34.5vh !important;
}

.length-180-min {
  height: 44.5vh !important;
}

.schedule-content-item-title {
  padding-left: 0.5rem;
  margin-right: 0.5rem;
}

/* Coloring by Category */
.main-event-text {
  color: var(--color-main-event);
}

.workshop-text {
  color: var(--color-workshop);
}

.food-text {
  color: var(--color-food);
}

.mini-event-text {
  color: var(--color-mini-event);
}

.demo-text {
  color: var(--color-demo);
}

/* border-color: darken(background-color, 25%) */
.main-event {
  background-color: var(--color-main-event);
  border-color: var(--color-main-event-border);
}

.mini-event {
  background-color: var(--color-mini-event);
  border-color: var(--color-mini-event-border);
}

.demo-event {
  background-color: var(--color-demo);
  border-color: var(--color-demo-border);
}

.workshop-event {
  background-color: var(--color-workshop);
  border-color: var(--color-workshop-border);
}

.chat-event {
  background-color: var(--color-food);
  border-color: var(--color-food-border);
}

.checklist.container {
  z-index: 10;
  padding: 0;
  margin: 0;
}

.pill-tag-div {
  padding-top: 3vh;
}

.pill-tags {
  background-color: var(--color-secondary);
  color: var(--color-foreground);
  border-radius: var(--border-radius);
  padding: 0.4rem 0.8rem;
  margin: 0 0.4rem;
}

.pill-tags:hover {
  background-color: var(--color-secondary-muted);
}


@media only screen and (min-width: 1101px){
  .schedule-list-title-item {
    font-size: 20px !important;
  }
  .schedule-content-item {
    font-size: 14px !important;
    line-height: 17px !important;
  }
  .length-30-min,
  .length-45-min {
    font-size: 13px !important;
    line-height: 15px !important;
  }
  .tag-dropdown::v-deep .btn,
  .timewindow,
  .btn {
    font-size: 17px !important;
  }
}

@media only screen and (min-width: 701px) and (max-width: 1100px){
  .schedule-list-title-item {
    font-size: 16px !important;
  }
  .schedule-content-item {
    font-size: 11px !important;
    line-height: 13px !important;
  }
  .length-30-min,
  .length-45-min {
    font-size: 8px !important;
    line-height: 10px !important;
  }
  .tag-dropdown::v-deep .btn,
  .timewindow,
  .btn{
    font-size: 14px !important;
  }
  .schedule-content-item-star-size {
    width: 14px;
    height: 14px;
  }
}

@media only screen and (min-width: 301px) and (max-width: 700px){
  .schedule-list-title-item {
    font-size: 14px !important;
  }
  .schedule-content-item {
    font-size: 8px !important;
    line-height: 10px !important;
  }
  .length-30-min,
  .length-45-min {
    font-size: 6px !important;
    line-height: 8px !important;
  }
  .tag-dropdown::v-deep .btn,
  .timewindow,
  .btn {
    font-size: 10px !important;
  }
  .schedule-content-item-star-size {
    width: 12px;
    height: 12px;
  }
}
</style>
