(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function Observable (subscribeFunction) {
    let self = this;
    this.subscriberUpdateFunction = function() {}
    this.observer = {
        next : function(val) {
            self.subscriberUpdateFunction(val);
        }
    };
    this.subscribe = (subFunction) => {
        this.subscriberUpdateFunction = subFunction
        subscribeFunction(this.observer);
    }
    this.next = function(val) {
        this.subscriberUpdateFunction(val);
    }
}
},{}],2:[function(require,module,exports){
let Observable = require("./Observable.js");

module.exports.get = function(url) {
    console.log("using durable fetch");
    let obs = new Observable((observer)=> {
        const numAttempts = 3;
        let iteration = 0;
        let done = false;
        function attempt () {
            if (done || iteration > numAttempts) {
                observer.next({
                    status : "FAIL"
                })
                return;
            }
            fetch(url)
                .then(function(response) {
                    if (response.status == 200) {
                        response.json().
                        then((data)=> {
                            observer.next({
                                status : "SUCCESS",
                                data : data
                            })
                        });
                    } else {
                        observer.next({
                            status : "FAILED_ATTEMPT",
                            data : data
                        })
                        attempt();
                    }
                })
                .catch((error) => {
                    observer.next({
                        status : "ERROR",
                        error : error
                    })
                    observer.next({
                        status : "FAILED_ATTEMPT",
                    })
                    attempt();
                });
        }
        attempt();
    })
    return obs;
}
},{"./Observable.js":1}],3:[function(require,module,exports){


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
},{"./durable-fetch":2}]},{},[3]);
