# Frontend Of DHSTTOS

This project is the main page of the frontend application, the login page is not (yet) integrated. For the login page only, see [`../login-frontend`](https://github.com/DHSTTOS/implementation/tree/master/login-frontend).

## How To Create A Production Build

0. `cd` into this sub directory
1. Install dependencies with `npm i` (please don't use `yarn`)
1. Run `npm run build` to create an optimized production build

Because we allow the user to enter their own WebSocket endpoint of DHSTTOS backend, this web application can be hosted anywhere. One thing to notice is that for most browsers, if the user loads this app from a server which enforces HTTPS (eg. vanilla Netlify), they won't be able to connect to an unencrypted WebSocket endpoint via `ws://` protocol, so `wss://` is required.

## How To Fire This Up For Development

0. `cd` into this sub directory
1. Install dependencies with `npm i` (please don't use `yarn`)
1. Run `npm start` to spin up a local dev server
1. Go to the URL printed in the console

`http://localhost` allows you to connect to an unencrypted WebSocket endpoint.

## Recommended Tools

- **IDE** - VS Code
- **Node** - v10.13.0 or above

For VS Code, I've got a `.vscode` folder for all the recommended extensions for this project. If you open up this project as a workspace, VS Code should automatically prompt you about installing the recommended extensions. Click "OK" or "Yes" will do :)

## Notes On How To Contribute

This project uses [React](https://reactjs.org/tutorial/tutorial.html) for all the UI elements, [MobX](https://mobx.js.org/getting-started.html) for state management, [D3v5](https://d3js.org/#introduction), D3v2 (only for the node-link diagram) and [Nivo](https://nivo.rocks/) for rendering the diagrams.

All the diagram components are placed inside [`/src/components/Diagram`](src/components/Diagram) directory.

Before creating a PR, please run `npm run format` to do an autoformat, so that we can keep the code style consistent throughout the project.

The [`/src/libs`](src/libs) should contain _ONLY_ static helper functions or classes. Do _not_ invoke any methods or functions on the root level of any files there, as it might create a dependency loop/deadlock situation. (Due to the scripting nature of JS, you can imagine everything is wrapped inside an invisible `main()` function. The engine executes every single line when it runs through the source code.)

State management is handled with MobX in a observer/reactive manner. Access and mutate the state anywhere inside the project via simply referencing the corresponding class attributes inside [`/stores`](src/stores) or reassigning values to them.

Most of the development of the node-link diagram was happening inside [`../misc/network_demo`](https://github.com/DHSTTOS/implementation/tree/master/misc/network_demo), but we have already migrated everything there into [`/src/components/Diagram/NodeLinkBlock.js`](src/components/Diagram/NodeLinkBlock.js).

If you have access to our server, log in as root (I know 😅) and run `boom` to rebuild and redeploy both the login page and this app based on the latest master branch, in order to test the complete frontend suite.

## License

The source code of this project (DHSTTOS Frontend) is licensed under [BSD 4-Clause "Original" license](LICENSE).

For other modules of the DHSTTOS platform (eg. the backend server code), please refer to the respective license documents in their own subdirectories.

## Credits

[Klevia Ulqinaku](https://github.com/klevia) - Login Page UI, Data Visualization

[Philipp Mergenthaler](https://github.com/pm8008) - Client-Server Communication, Data Visualization

[Xiaoru Li](https://github.com/hexrcs) - Original UI design, Main Page UI, Data Visualization, Client-Server Communication, Project Logo Design
