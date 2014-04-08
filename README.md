praad
=====
[![Code Climate](https://codeclimate.com/github/deiwin/praad.png)](https://codeclimate.com/github/deiwin/praad) [![Build Status](https://travis-ci.org/deiwin/praad.svg)](https://travis-ci.org/deiwin/praad) [![Coverage Status](https://coveralls.io/repos/deiwin/praad/badge.png)](https://coveralls.io/r/deiwin/praad) [![Selenium Test Status](https://saucelabs.com/buildstatus/deiwin)](https://saucelabs.com/u/deiwin)


## Development setup ##

To run the tests on your own machine you need to first install [node.js](nodejs.org). Once you have it installed just run:
    
    npm install -g grunt-cli
    git clone git@github.com:deiwin/praad.git
    cd praad
    npm install
    grunt test

### Looking at the page ###

The simplest way to see the page in action is to open the `public/index.html` file in you browser. This works for now,
but soon enough the data will be coming from the server and the page must be started with `npm start`. Currently
`npm start` will run a static server that you can access at `http://localhost:8080`.
