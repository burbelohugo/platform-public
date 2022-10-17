/**
 * Contains common functionality for displaying user data
 */

export default {
  methods: {
    /**
     * Returns the user's profile image
     * @param {*} user User object from DynamoDB
     * @returns an image source as a string
     */
    getProfileImageForUser(user) {
      return `https://avatars.dicebear.com/api/identicon/${user.id}.svg`;
    },
  },
};
