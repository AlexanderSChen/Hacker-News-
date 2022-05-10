"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

// select body
const $body = $("body");


const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");

const $storiesLists = $(".stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $submitForm =$("#submit-form");

const $navSubmitStory = $("#nav-submit-story");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $userProfile = $("#user-profile");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

// create a function to hide the page components which includes the stories list, submit form, user profile, all stories list, login form, and signup form.
function hidePageComponents() {
  // create an array with the components we would like to hide when we run the function
  const components = [
    $storiesLists,
    $submitForm,
    $userProfile,
    $allStoriesList,
    $loginForm,
    $signupForm,
  ];
  // use the forEach function to go through all the array elements and use the hide function.
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  // retrieve the all stories list and display them once the user is logged in
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
