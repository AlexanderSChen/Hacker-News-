"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  // store the storyList in a variable using the getStories function
  storyList = await StoryList.getStories();
  // remove the loading message 
  $storiesLoadingMsg.remove();
  // use putStoriesOnPage function to display the stories
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  // use getHostName function to get the story's url and store it in a variable
  const hostName = story.getHostName();

  // if there is a current user then showStar is true, if not then it is false.
  const showStar = Boolean(currentUser);

  // return the story html which is an li containing the story id, if showDeleteBtn is false then it returns nothing, if true it returns getDelteBtnHTML. if showStar is true it runs getStarHTML which has the story and currentUser as params, which determines if the star is filled or hollow. If false, it returns nothing. an anchor tag with the story url and story title is displayed along with the host name, story author, and story username.
  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// function that creates the delete button html
function getDeleteBtnHTML() {
  // returns a span with class trash can which uses twitter bootstrap to create the trash can icon.
  return `
    <span class="trash-can">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}

// function that gets the star html that accepts the story and user as params
function getStarHTML(story, user) {
  // if the story is favorited by the user it is checked using the isFavorite function.
  const isFavorite = user.isFavorite(story);
  // the star type is determined using a turnary operator if isFavorite is true then it returns a filled in star and if false it returns a hollow star
  const starType = isFavorite ? "fas" : "far";
  // return the html which contains a span with class star which uses twitter bootstrap to create the icon and i with star type
  return `
    <span class="star">
      <i class="${starType} fa-star"></i>
    </span>`;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  // empty the story list
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    // creat the html for the story
    const $story = generateStoryMarkup(story);
    // append the story to the story list
    $allStoriesList.append($story);
  }

  // show the story list with all the stories on the page
  $allStoriesList.show();
}

// deleting a story
async function deleteStory(e) {
  console.debug("deleteStory");

  // select the closest li to the clicked trashcan
  const $closestLi = $(e.target).closest("li");
  // store the closest li's id in the storyId.
  const storyId = $closestLi.attr("id");

  // remove the story from the storyList
  await storyList.removeStory(currentUser, storyId);

  // put the user's stories back on the page.
  await putUserStoriesOnPage();
}
// when the trash can is clicked execute deleteStory function
$ownStories.on("click", ".trash-can", deleteStory);

// function to handle a new story submit 
async function submitNewStory(e) {
  console.debug("submitNewStory");
  // prevent page refresh
  e.preventDefault();

  // select all the user input elements from the form in the html when the submit button is clicked in the nav bar
  // select the user's title
  const title = $("#create-title").val();
  // select the user's story url
  const url = $("#create-url").val();
  // select the user's name
  const author = $("#create-author").val();
  // select the current user's username
  const username = currentUser.username
  // select the story data that is saved as an object containing the title, url, author, and username
  const storyData = {title, url, author, username};

  // using the addStory method in the storyList class using the current user and storyData as parameters
  const story = await storyList.addStory(currentUser, storyData);

  // use the generateStoryMarkup function to add the new story into the html
  const $story = generateStoryMarkup(story);
  // prepend the new story to the story list so it appears at the top in the 1. position
  $allStoriesList.prepend($story);

  // slowly retracts the form after the story is submitted
  $submitForm.slideUp("slow");
  // trigger a rest on the form to make all the inputs blank again 
  $submitForm.trigger("reset");
}
// run submitNewStory function when the form is submitted.
$submitForm.on("submit", submitNewStory);


// function that puts the user's stories on the page for when "my stories" is clicked in the navigation
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  // empty own stories, resets the page
  $ownStories.empty();

  // if the user has not created any of his own stories then if statement executes
  if(currentUser.ownStories.length === 0) {
    // a small header with a message displays
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    // if the user has a story use a for of loop to display all of the user's stories
    for(let story of currentUser.ownStories) {
      // generate the html for the story with a boolean set to true so it will display the trash icon.
      let $story = generateStoryMarkup(story, true);
      // append the story to ownStories
      $ownStories.append($story);
    }
  }

  // show the user's stories on the page
  $ownStories.show();
}

// function that displays the favorited stories
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  // empty favorited stories to reset them.
  $favoritedStories.empty();

  // if there are no current favorites then the message is displayed
  if(currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // use for of loop to populate the favorites on the page
    for(let story of currentUser.favorites) {
      // create the html for the story
      const $story = generateStoryMarkup(story);
      // append it to the favorited stories
      $favoritedStories.append($story);
    }
  }

  // show the favorited stories on the page
  $favoritedStories.show();
}

// function that toggles the favorite icon
async function toggleStoryFavorite(e) {
  console.debug("toggleStoryFavorite");

  // store the target in a variable
  const $tgt = $(e.target);
  // select the closest li to the target and store it in a variable
  const $closestLi = $tgt.closest("li");
  // select the closest li's id and store it as the storyId
  const storyId = $closestLi.attr("id");
  // go through the storyList to find the storyId that matches the selected storyId and store it in story variable
  const story = storyList.stories.find(s => s.storyId === storyId);

  // if the target has "fas" class which means it is already favorited then the if statement is executed
  if($tgt.hasClass("fas")) {
    // remove the story from the current user's favorited story
    await currentUser.removeFavorite(story);
    // change the star from filled to hollow
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // if the story is not favorited then add it as a favorite
    await currentUser.addFavorite(story);
    // toggle the star so it is filled now signifying it is favorited
    $tgt.closest("i").toggleClass("fas far");
  }
}
// when the star is clicked then execute toggleStoryFavorite function
$storiesLists.on("click", ".star", toggleStoryFavorite);

// the stories javascript file has 10 functions that include: getAndShowStoriesOnStart, generateStoryMarkup, getDeleteBtnHTML, getStarHTML, putStoriesOnPage, deleteStory, submitNewStory, putUserStoriesOnPage, putFavoritesListOnPage, and toggleStoryFavorite.
// this encompasses all the functions for creating new stories, toggling story favorites, and deleting stories on the page.