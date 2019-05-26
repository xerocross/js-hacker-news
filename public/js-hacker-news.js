let topStoriesURL = "https://shaky-hacker-news.herokuapp.com/topstories";
topStoriesURL = "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
let storyIndex = [];


function getItemUrl (itemNum) {
    return `https://shaky-hacker-news.herokuapp.com/item/${itemNum}`;
}

function buildListItem (id, data) {
    let li = document.createElement("li");
    li.setAttribute("data-item-id", id);
    li.appendChild(document.createTextNode(data.title));
}

function fetchTopStoryIndex () {
    fetch(topStoriesURL)
        .then(function(response) {
            return response.json();
        })
        .then((res)=>{
            console.log(res);
            storyIndex = res.slice(0, 50);
        })
        .catch((error) => console.error(error));
}

const loadButton = document.querySelector("#loadButton");
loadButton.addEventListener("click", function() {
    fetchTopStoryIndex();
})