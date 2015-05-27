![logo](https://cdn.rawgit.com/Lunchr/luncher-client/2d26172e6474a312618911f4064dbb5e98ddd8a1/public/img/luncher-logo-typo-black.svg "Luncher")

A client
=====
[![Code Climate](https://codeclimate.com/github/Lunchr/luncher-client.png)](https://codeclimate.com/github/Lunchr/luncher-client) [![Build Status](https://travis-ci.org/Lunchr/luncher-client.svg)](https://travis-ci.org/Lunchr/luncher-client) [![Coverage Status](https://coveralls.io/repos/Lunchr/luncher-client/badge.svg)](https://coveralls.io/r/Lunchr/luncher-client) [![Selenium Test Status](https://saucelabs.com/buildstatus/deiwin)](https://saucelabs.com/u/deiwin)


## Development setup ##

To run the tests on your own machine you need to first install [node.js](nodejs.org). Once you have it installed just run:

    npm install -g grunt-cli
    git clone git@github.com:Lunchr/luncher-client.git
    cd luncher-client
    npm install
    bower install
    grunt test
