"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  // hide the page components
  hidePageComponents();
  // display all the stories
  putStoriesOnPage();
}
// the all button executes navAllStories function
$body.on("click", "#nav-all", navAllStories);

// function that handles the submit button in the nav bar
function navSubmitStoryClick(e) {
  // use console.debug to handle when submit button is clicked
  console.debug("navSubmitStoryClick", e);
  // hide the page components 
  hidePageComponents();
  // show the stories list
  $allStoriesList.show();
  // show the form to submit the story
  $submitForm.show();
}

// handle click for story submit button
$navSubmitStory.on("click", navSubmitStoryClick);

// function for when the favorite button is clicked, which will either add or remove a story to favorites
function navFavoritesClick(e) {
  console.debug("navFavoritesClick", e);
  // hide the page components
  hidePageComponents();
  // display all the favorited stories
  putFavoritesListOnPage();
}
// when the favorites button is clicked run the navFavoritesClick function
$body.on("click", "#nav-favorites", navFavoritesClick);

// function to handle when my stories button in nav bar is clicked
function navMyStories(e) {
  console.debug("navMyStories", e);
  // hide the page components
  hidePageComponents();
  // display the user created stories on the page
  putUserStoriesOnPage();
  // show the user's own stories 
  $ownStories.show();
}
// when the my stories button is clicked execute navMyStories
$body.on("click", "#nav-my-stories", navMyStories);

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  // hide the page components
  hidePageComponents();
  // show the login form
  $loginForm.show();
  // show the signup form
  $signupForm.show();
  // both forms are displayed so the user can choose whether to create a new account or login if they already have an account
}
// when the login button is clicked, execute the navLoginClick function 
$navLogin.on("click", navLoginClick);

// function that handles when the profile/username is clicked in the nav bar
function navProfileClick(e) {
  console.debug("navProfileClick", e);
  // hide the page components
  hidePageComponents();
  // show the user profile
  $userProfile.show();
}
// when the profile is clicked run navProfileClick function
$navUserProfile.on("click", navProfileClick);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  // display the main nav links
  $(".main-nav-links").show();
  // hide the login button
  $navLogin.hide();
  // show the logout button
  $navLogOut.show();
  // display the user's username as the profile button
  $navUserProfile.text(`${currentUser.username}`).show();
}

// the nav js page handles all the navigation bar's functions, which has 5 buttons: the stories button, which is hack or snooze, submit new story, favorites, my story, and profile login/logout button depending if user is currently logged in.
// thanks to the main js which already selected all the page's elements we can easily hide or show them according to which button is pressed in the navigation bar