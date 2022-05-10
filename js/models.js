"use strict";

// setup base url so it is easily retrievable.
const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  // use a constructor to store the elements necessary for our stories.
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // function returns a new URL of this.url which was constructed above using the .host function which returns the domain name as well as the port number(if available) of the current webpage.
    return new URL(this.url).host;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  // a new class that and constructor for the StoryList
  constructor(stories) {
    // construct the stories for the StoryList
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  // have addStory take in user, and object containing title, author, and url
  async addStory(user, {title, author, url}) {
    // retrieve user login token
    const token = user.loginToken;
    // retrieve response data that contains an object containing post method, url, and data using the addStory parameters
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/stories`,
      data: { token, story: {title, author, url}},
    });

    // use Story class to assign the response story data to story variable
    const story = new Story(response.data.story);
    // add new story to the beginning of the stories array using unshift
    this.stories.unshift(story);
    // add the new story to the user's ownStories using unshift
    user.ownStories.unshift(story);

    // return the newly added story 
    return story;
  }

  // function to remove story
  async removeStory(user, storyId) {
    // retrieve the login token
    const token = user.loginToken;
    // await axios object with the url, delete method, and data containing the login token
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: { token: user.loginToken}
    });

    // filter through the stories and store the storyIds that are not matching the slected storyId
    this.stories = this.stories.filter(story => story.storyId !== storyId);

    // go through the user's stories and filter through them returning the storyIds that are not matching the selected storyId
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    // go through the user's favorites and return the storyIds that are not matching the selected storyId.
    user.favorites = user.favorite.filter(s => s.storyId !== storyId);
    // by returning the storyIds that do not match the storyId we want to remove we are effectively removing the story from the stories, the user's own stories, and the user's favorites.
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  // create a constructor with the user's information
  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  // create static async function signup 
  static async signup(username, password, name) {
    // store the url/signup, post method, and data containing the user's username, password, and name into response
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    // create user object that stores the user data
    let { user } = response.data

    // return the new user class with all the necessary user data.
    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  // create a static async function for login 
  static async login(username, password) {
    // store the object containing the url/login, post method, and data with the user's username and password
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    // store the response data into a newly created user object
    let { user } = response.data;

    // return the new User class with the necessary user data.
    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  // create static async function for loginViaStoredCredentials
  static async loginViaStoredCredentials(token, username) {
    // use try and catch just in case the function fails
    try {
      // store url/users/username in the url, get method, and token object for params
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      // create user object for the response data
      let { user } = response.data;

      // return the user with the corresponding user data in an object for username, name, created date, favorites, own stories, and token outside the object
      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
      // if there is an error then the catch displays the fail message and returns null.
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  // add favorite function for favorited stories
  async addFavorite(story) {
    // push the selected story into the favorites array.
    this.favorites.push(story);
    // await add or remove favorite function with add and story as the params
    await this._addOrRemoveFavorite("add", story)
  }

  // remove favorite function for favorited stories
  async removeFavorite(story) {
    // store filtered favorites that do not match the selected story Id which removes the selected story from favorites
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    // await the add or remove favorite function with remove as the state and story as the params.
    await this._addOrRemoveFavorite("remove", story);
  }

  // the add or remove favorite function accepts the newState and story as the params.
  async _addOrRemoveFavorite(newState, story) {
    // store the newState using a turnary operator if the newState === add then return POST otherwise return DELETE into method
    const method = newState === "add" ? "POST" : "DELETE";
    // retrieve the login token 
    const token = this.loginToken;
    // update the axios with the url/users/username/favorites/storyId, add or remove method, and login token for the data
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: {token},
    });
  }

  // create function if story is favorited 
  isFavorite(story) {
    // returns the favorites with the storyId that matches the selected storyId.
    return this.favorites.some(s => (s.storyId === story.storyId));
  }
}

// the models js file contains 3 classes: story, storyList, and user.
// the story class has 2 things in it: the constructor which constructs everything we need to create unique stories, which is the storyId, title, author, url, username, and creation date and getHostName which returns url host. This has all the story functions.
// the storyList class contains a constructor for stories and 3 functions: getStories, addStory, and removeStory. This encompasses all the story functions
// the User class has a constructor for all the user data and 7 functions: signup, login, loginViaStoredCredentials, addFavorite, removeFavorite, _addOrRemoveFavorite, and isFavorite. This encompasses all the user functions.