require("promise-polyfill");
require("isomorphic-fetch");

let topStoriesURL = "https://shaky-hacker-news.herokuapp.com/topstories";
//topStoriesURL = "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
let storyIndex = [];
let stories = {};
let get = require("./durable-fetch").get;

stories.set = function(id, data) {
    this[id] = data;
    //getLiById(id).appendChild(document.createTextNode(data.title));
}

function buildList() {
    let ul = document.querySelector("[story-items-list]");
    for (let i = 0; i < storyIndex.length; i++) {
        let li = buildListItem(storyIndex[i], stories[i]);
        ul.appendChild(li);
    }
    document.querySelector("#story-items-list").style.visibility = "visible";
}

function getLiById( itemId) {
    return document.querySelector(`[data-item-id=x${itemId}]`);
}

function setItemHTML (itemId, html) {
    getLiById(itemId).innerHTML = html;
}

function getItemUrl (itemNum) {
    return `https://shaky-hacker-news.herokuapp.com/item/${itemNum}`;
    //return `https://hacker-news.firebaseio.com/v0/item/${itemNum}.json?print=pretty`;
}

function buildListItem (id, data) {
    let li = document.createElement("li");
    li.setAttribute("data-item-id", "x" + id);
    //list-group-item
    li.classList.add("list-group-item");
    return li;
}

function fetchTopStoryIndex () {
    setLoadingMessage("<span>loading</span>")
    let promise = new Promise( (resolve, reject) => {
        get(topStoriesURL).
        subscribe((val)=> {
            if(val.status == "SUCCESS") {
                storyIndex = val.data.slice(0, 50);
                clearLoadingMessage();
                resolve();
            } else if (val.status == "FAILED_ATTEMPT") {
                setLoadingMessage("<span>loading failed; retrying</span>");
            } else if (val.status == "FAIL") {
                setLoadingMessage("<span>loading failed all attempts</span>");
                reject();
            }
            
        });
    });
    return promise;
}

function setLoadingMessage(html) {
    document.querySelector("#main-loading-div").innerHTML = html;
}
function clearLoadingMessage() {
    document.querySelector("#main-loading-div").style.visibility = "hidden";
}

function getStoryItem (id) {
    setItemHTML(id, "<span>loading...</span>");
    return new Promise( (resolve, reject) => {

        let url = getItemUrl(id);
        get(url)
        .subscribe ((val)=> {
            if(val.status == "SUCCESS") {
                stories.set(id, val.data);
                setItemHTML(id, `<a href = "${val.data.url}">${val.data.title}</a>`);
                resolve();
            } else if (val.status == "FAILED_ATTEMPT") {
                setItemHTML(id, "<span>loading failed; retrying</span>");
            }
            if (val.status == "FAIL") {
                setItemHTML(id, "<span>loading failed all attempts</span>");
                reject();
            }
        });
    });
}

function getAllStories () {
    let promises = [];
    promises.push(
        stories.forEach((id) => {
            getStoryItem(id);

        })
    );
    return Promise.all();
}

const loadButton = document.querySelector("#loadButton");
loadButton.addEventListener("click", function() {
    //console.log("loading");
    fetchTopStoryIndex()
    .then(()=>{
        buildList();
        storyIndex.forEach((id)=> {
            getStoryItem(id);
        })
    })
})