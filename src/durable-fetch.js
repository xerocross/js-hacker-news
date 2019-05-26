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