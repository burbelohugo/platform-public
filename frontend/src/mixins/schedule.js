const eventBrandingTypes = {
  'workshop-event': {
    class: 'workshop-event',
  },
  'main-event': {
    class: 'main-event',
  },
  'chat-event': {
    class: 'chat-event',
  },
  'mini-event': {
    class: 'mini-event',
  },
  'demo-event': {
    class: 'demo-event',
  },
};
const diversityEvents = ['PLUMAS Social Justice and Tech', 'Trivia Night', 'Technichat: Diversity and Inclusion', 'TCM: Underrepresented People in Tech', 'Technichat: Women in Tech', 'TCM: Tech for Social Good', 'TCM: Non-Traditional Roles in Tech'];
const placeholderCategory = Object.keys(eventBrandingTypes)[0];

export default {
  methods: {
    selectTitleItem(day) {
      this.selectedDay = day;
    },
    selectTag(i) {
      if (i == 0) {
        this.tags[i].checked = !this.tags[i].checked;

        for (let idx=1; idx<this.tags.length; idx++) {
          this.tags[idx].checked = this.tags[0].checked;
        }

        this.days.forEach((day) => {
          this.timeWindows.forEach((timeWindow) => {
            this.formattedEvents[day][timeWindow].forEach((event) => {
              event.display = this.tags[i].checked
            });
          });
        });
      }
      else {
        this.tags[i].checked = !this.tags[i].checked;

        let allEventsSelected = true

        for (let idx=1; idx<this.tags.length; idx++) {
          allEventsSelected = this.tags[idx].checked && allEventsSelected;
        }

        this.tags[0].checked = allEventsSelected

        const selectedTags = this.tags.filter((tagObj) => tagObj.checked).map((tagObj) => tagObj.text)
        // if tag now unchecked, events that don't have tag should now show, and vice versa
        this.days.forEach((day) => {
          this.timeWindows.forEach((timeWindow) => {
            this.formattedEvents[day][timeWindow].forEach((event) => {
              let show = false
              selectedTags.forEach((tag) => {
                if (event.tags.length > 0 && event.tags.includes(tag)) { show = true }
              });
              if (event.tags.length === undefined) { show = true }
              // eslint-disable-next-line no-param-reassign
              event.display = show;
            });
          });
        });
      }
    },
    selectMode(mode) {
      // if tag now unchecked, events that don't have tag should now show, and vice versa
      this.days.forEach((day) => {
        this.timeWindows.forEach((timeWindow) => {
          this.formattedEvents[day][timeWindow].forEach((event) => {
            // console.log(event.location)
            switch (mode) {
              case "all":
                event.displayMode = true;
                break;
              case "inperson":
                event.displayMode = (event.mode !== "Virtual");
                break;
              case "online":
                event.displayMode = (event.mode !== "In-person");
                break;
            }
          });
        });
      });
    },
    getTimeDescriptionForEvent(event) {
      if (event.start_time) {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        return `${this.getDayOfTheWeek(start)}, ${this.formatAMPM(start)} – ${this.formatAMPM(end)} ${start.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]}`;
      }
      return '';
    },
    getBannerImgForEvent(event) {
      // Returns the banner image URL for the event, which corresponds to its category
      // If it doesn't have a valid category, exit
      const images = require.context('../assets/event-banners', false, /\.jpg$/);
      const category = eventBrandingTypes[event.category]
        ? event.category
        : placeholderCategory;

      return images(`./${category}.jpg`);
    },
    openScheduleModal(selectedDay, timeWindow, scheduleColumn) {
      // eslint-disable-next-line max-len
      this.selectedEvent = this.formattedEvents[selectedDay][timeWindow].find((event) => event.column === scheduleColumn);
      this.selectedEvent.selectedDay = selectedDay;
      this.selectedEvent.timeWindow = timeWindow;
      this.selectedEvent.scheduleColumn = scheduleColumn;
      this.$bvModal.show('scheduleEventModal');
    },
    openScheduleModalDirect(event) {
      this.selectedEvent = event;
      this.$bvModal.show('scheduleEventModal');
    },
    generateAddToCalendarLink(event, calendarService) {
      // Recast date strings to dates to get strings that work well with the calndr.link API
      const getDateString = (timestring) => new Date(timestring).toISOString().split('.')[0];
      const start = getDateString(event.start_time);
      const end = getDateString(event.end_time);
      const timezone = 'UTC';
      const link = this.getLinkForEvent(event);
      return encodeURI(
        `https://calndr.link/d/event/?service=${calendarService}&start=${start}&end=${end}&timezone=${timezone}&title=${event.event_name}&location=${link}&calname=bitcamp-event&description=Click to join the event: ${link}.`,
      );
    },
    getLinkForEvent(event) {
      return event.link || event.zoom_link || 'https://platform.gotechnica.org';
    },
    getTagsForEvent(event) {
      return event.tags;
    },
    populateDays() {
      const currentDate = new Date(this.startDate);

      // This code might not work at the end of the month
      while (currentDate.getDate() <= this.endDate.getDate()) {
        this.days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Make schedule start on the current day
      const nowString = (new Date()).toDateString();
      const today = this.days.find((day) => day.toDateString() === nowString);
      this.selectedDay = today || this.days[0];
    },
    prepareTimeWindows() {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      const currentTime = new Date(midnight);

      // Go through every possible 30 minute increment in a day
      do {
        this.timeWindows.push(this.formatAMPM(currentTime));
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      } while (this.formatAMPM(currentTime) !== this.formatAMPM(midnight));
    },
    getDurationOfEvent(start, end, eventObj) {
      if (eventObj.event_name === 'Open Mic Night') {
        return 120;
      }
      if (eventObj.event_name === 'Zine-Making Workshop') {
        return 60;
      }
      const diff = end.getTime() - start.getTime();
      return (diff / 60000);
    },
    processRawEvents() {
      for (let i = 0; i < this.rawEvents.length; i += 1) {
        // deep clone object
        // eslint-disable-next-line max-len
        this.rawEvents[i].branding = JSON.parse(JSON.stringify(eventBrandingTypes[this.rawEvents[i].category] || eventBrandingTypes[placeholderCategory]));
        const start = new Date(this.rawEvents[i].start_time);
        const end = new Date(this.rawEvents[i].end_time);
        this.rawEvents[i].branding.class += ` length-${this.getDurationOfEvent(start, end, this.rawEvents[i])}-min`;
        if (end < (new Date())) {
          // this.rawEvents[i].branding.class += ' event-passed';
          // this.rawEvents[i].alreadyOccurred = true;
        } else {
          this.rawEvents[i].alreadyOccurred = false;
        }
        this.rawEvents[i].addedToUserList = false;
        if (this.eventsInUserList.includes(this.rawEvents[i].id)) {
          this.rawEvents[i].addedToUserList = true;
          // eslint-disable-next-line max-len
          this.rawEvents[i].addedEventId = this.eventsInUserList.find((event_id) => event_id === this.rawEvents[i].id).id;
        }
        if (diversityEvents.includes(this.rawEvents[i].event_name)) {
          this.rawEvents[i].display_horizons_icon = true;
        }

        // getting all the possible tags from what tags events have
        if (this.rawEvents[i].tags && this.rawEvents[i].tags.length > 0) {
          this.rawEvents[i].tags.forEach((t) => {
            if (this.tags.findIndex((x) => x.text === t) === -1 && t !== "") {
              this.tags.push({
                text: t,
                checked: true,
              });
            }
          });
        }
      }
      this.days.forEach((day) => {
        this.formattedEvents[day] = {};
        this.timeWindows.forEach((timeWindow) => {
          this.formattedEvents[day][timeWindow] = this.getEventsForTimeWindow(timeWindow, day);
        });
      });
    },
    convertTimeWindowTo24HourFormat(timeWindow) {
      if (timeWindow.includes('12:00AM')) {
        return '00:00:00';
      }
      if (timeWindow.includes('12:30AM')) {
        return '00:30:00';
      }
      if (timeWindow.includes('12:00PM')) {
        return '12:00:00';
      }
      if (timeWindow.includes('12:30PM')) {
        return '12:30:00';
      }
      if (timeWindow.includes('AM')) {
        return `${timeWindow.substr(0, timeWindow.indexOf('AM'))}:00`;
      }
      if (timeWindow.includes(':00')) {
        return `${(parseInt(timeWindow.substr(0, timeWindow.indexOf(':')), 10) + 12).toString()}:00:00`;
      }
      return `${(parseInt(timeWindow.substr(0, timeWindow.indexOf(':')), 10) + 12).toString()}:30:00`;
    },
    getEventsForTimeWindow(timeWindow, day) {
      const eventsForWindow = this.rawEvents.filter((rawEvent) => {
        const rawEventStart = (new Date(rawEvent.start_time));
        return this.formatAMPM(rawEventStart) === timeWindow
          && rawEventStart.getDate() === day.getDate();
      });

      const previousColumns = [];
      eventsForWindow.forEach((event) => {
        // eslint-disable-next-line no-param-reassign
        event.display = true;
        event.displayMode = true;
        if (event.column) {
          // eslint-disable-next-line no-param-reassign
          event.column = parseInt(event.column, 10);
        } else {
          let randomColumn = Math.floor(Math.random() * this.scheduleColumns) + 1;
          while (previousColumns.includes(randomColumn)) {
            randomColumn = Math.floor(Math.random() * this.scheduleColumns) + 1;
          }
          // eslint-disable-next-line no-param-reassign
          event.column = randomColumn;
        }
      });

      return eventsForWindow;
    },
    getFavoriteIconForEvent(event) {
      // Sane defaults for the file names
      const images = require.context('../assets', false, /\.svg|png$/);
      return images(`./${(event.addedToUserList ? 'star_filled.svg' : 'star_empty.svg')}`);
    },
    async toggleEventInList(targetEvent) {
      // eslint-disable-next-line no-param-reassign
      targetEvent.addedToUserList = !targetEvent.addedToUserList;
      this.$forceUpdate();

      // console.log(this.eventsInUserList);

      // Initialize events array if it doesn't exist
      this.eventsInUserList = this.eventsInUserList || [];
      if (!this.eventsInUserList.find((event) => event === targetEvent.id)) {
        const addEventToUserListParams = {
          user_id: this.getUserId(),
          event_id: targetEvent.id,
        };
        await this.performPostRequest(this.getEnvVariable('BACKEND'), 'schedule/user/event', addEventToUserListParams);
        // eslint-disable-next-line no-param-reassign
        this.eventsInUserList.push(targetEvent.id);
      } else {
        const removeEventParams = {
          user_id: this.getUserId(),
          event_id: targetEvent.id,
        };
        await this.performPostRequest(this.getEnvVariable('BACKEND'), 'schedule/user/events/delete', removeEventParams);
        this.eventsInUserList = this.eventsInUserList.filter((e) => e != targetEvent.id)
      }
    },
    async getEventsFromUserList() {
      const userParams = {
        user_id: this.getUserId(),
      };
      const rawEvents = await this.performGetRequest(this.getEnvVariable('BACKEND'), 'schedule/user/event', userParams);
      this.eventsInUserList = rawEvents;
    },
  },
  computed: {
    getScheduleTimeLineWindow() {
      const d = new Date();
      const hours = d.getHours();
      let minutes = d.getMinutes();
      if (minutes > 29) {
        minutes = '30';
      } else {
        minutes = '00';
      }
      if (hours > 12) {
        return `${hours - 12}:${minutes}PM`;
      }
      return `${hours}:${minutes}AM`;
    },
  },
};
