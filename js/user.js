"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  // reset the loginForm  
  $loginForm.trigger("reset");

  // save the user's credentials in the cache using JSON with the saveUserCredentialsInLocalStorage function
  saveUserCredentialsInLocalStorage();
  // updates the ui when the user logs in 
  updateUIOnUserLogin();
}
// when the submit button is clicked it executes the login function
$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  // prevents page refresh
  evt.preventDefault();

  // store the user's name, username, and password values
  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  // save the user's credentials in the local storage
  saveUserCredentialsInLocalStorage();
  // updates the UI once the user has logged in
  updateUIOnUserLogin();

  // reset the signup form which emptys the values
  $signupForm.trigger("reset");
}
// when the submit button is clicked on the signup form the signup function is fun
$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  // clears the local storage
  localStorage.clear();
  // reloads the location
  location.reload();
  // logging out resets the user's information
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  // retrieves the token from the local storage and store it in a variable
  const token = localStorage.getItem("token");
  // retrieve username from local storage and store it in a variable
  const username = localStorage.getItem("username");
  // if there is no token or if there's no username then function returns false
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  // if there is a current user then if statement executes
  if (currentUser) {
    // set the current user's login token as token in the localStorage
    localStorage.setItem("token", currentUser.loginToken);
    // set the current user's username in the local storage.
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  // hide the page components
  hidePageComponents();

  // put the stories on the page
  putStoriesOnPage();
  // show all the stories on the list
  $allStoriesList.show();

  // update the nav bar on login so logout is displayed next to the username's profile
  updateNavOnLogin();
  // generate the user's profile which has creation date information
  generateUserProfile();
}

// function generates the user's profile
function generateUserProfile() {
  console.debug("genereateUserProfile");

  // set the profile id's for the name, username, and account date.
  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}

// the user js file has 7 functions which include: login, signup, logout, checkForRememberedUser, saveUserCredeintialsInLocalStorage, updateUIOnUserLogin, and generateUserProfile.
// this encompasses all the functions the user does and has the functions for storing information in the browser's local storage.