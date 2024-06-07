# Computer Science learning demos
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Netlify Status](https://api.netlify.com/api/v1/badges/0a4ab609-ce3f-426b-9319-356b99fcc907/deploy-status)](https://cs-demos.netlify.app/)

## Demos / endpoints:
* `?gameid=binary`: GCSE number bases (hex->binary, binary addition, shifts, denary->binary)
* `?gameid=exp`: build an expression. There are four optional modes (which you can enable independently from each other):
  * `&network=1`: network speed
  * `&audio=1`: audio size
  * `&bitmap=1`: bitmap size
  * `&resolution=1`: image resolution/size
* `?gameid=compsim`: low-level computer simulation with AQA assembly. Optional parameter: `mode=A` to hide the accumulator
* `?gameid=sortsearch`: linear search, binary search, bubble sort, merge sort. To disable merge sort, add `&nomerge=1`.
* `?gameid=network-mask`: AQA subnet mask practice
* `?gameid=str-format`: GCSE-style string formatting. To disable sign formatting, add `nosign=1`.

## Run code locally
After cloning the repository, run `npm i` to install all relevant dependencies. To start the server then, run
`npm start`

To build a deployable static frontend package, run `npm run build`
See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

This project was created using create-react-app; you can further customise the project by ronning `npm run eject`. **Note: this is a one-way operation. Once you `eject`, you can't go back!**
