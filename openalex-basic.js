
const request = require('request');
const fs = require('fs');

// combine command list arguments into a string for use with node
if (process.argv.length < 3) {
  console.log('Usage: node replacers.js <command> <words>');
  console.log('Example: node replacers.js N?(search|title|doi) "test"');
  process.exit(1);
};

let command = process.argv[2];
let words = process.argv.slice(3).join(' ');

// console.log(command);
// console.log(words);

// check whether the file replacers.json exists
if (fs.existsSync('replacers.json')) {
  // read a json file containing the replacers
  let replacers = require('./replacers.json')
  // iterate through the replacers object and replace the words with the appropriate values
  for (let key in replacers) {
    words = words.replace(key + ".", replacers[key])
  }
};

//console.log(words)
const per_page = 10;
const works = 'https://api.openalex.org/works';
const titlefilter = {
  url: works,
  qs: {
    per_page: per_page,
    filter: "title.search:" + words
  },
  json: true
};
const search = {
  url: works,
  qs: {
    per_page: per_page,
    search: words
  },
  json: true
};
const doi = {
  url: works,
  qs: {
    per_page: per_page,
    filter: "doi:" + words
  },
  json: true
};

let mode = "search";
// if command matches # then run the appropriate function
if (command.match(/^N/)) {
  command = command.replace(/^N/, '');
  mode = "count";
}

post = command === "search" ? search : (command === "title" ? titlefilter : (command === "doi" ? doi : null));

if (post) {
  request(post, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      if (mode === "count") {
        console.log(words + ":::" + pad(numberWithCommas(body.meta.count), 12));
      } else {
        // output the body of the response to the console with formatted JSON
        console.log(JSON.stringify(body, 4))
      };
    }
  })
} else {
  console.log("Invalid command: "+ command);
}

// create a function which space-pads a string
function pad(str, max) {
  str = str.toString()
  return str.length < max ? pad(" " + str, max) : str
}

// create a function which takes a number and returns the numbers with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
