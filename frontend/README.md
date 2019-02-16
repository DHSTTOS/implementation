# Frontend of DHSTTOS

This project is the main page of the frontend application, the login page is not (yet) integrated.

## How to Fire This Up

0. `cd` into this sub directory
1. Install dependencies with `npm i` (please don't use `yarn`)
2. Run `npm start` to spin up a local dev server
3. Go to the URL printed in the console

## Recommended Tools

- **IDE** - VS Code
- **Node** - v10.13.0 or above

For VS Code, I've got a `.vscode` folder for all the recommended extensions for this project. If you open up this project as a workspace, VS Code should automatically prompt you about installing the recommended extensions. Click "OK" or "Yes" will do :)

## Notes On How To Contribute

This project uses [React](https://reactjs.org/tutorial/tutorial.html) for all the UI elements, [MobX](https://mobx.js.org/getting-started.html) for state management, [D3v5](https://d3js.org/#introduction), D3v2 (only for the node-link diagram) and [Nivo](https://nivo.rocks/) for rendering the diagrams.

All the diagram components are placed inside [`/src/components/Diagram`](src/components/Diagram) directory.

Before creating a PR, please run `npm run format` to do an autoformat, so that we can keep the code style consistent throughout the project.

The [`/src/libs`](src/libs) should contain *ONLY* static helper functions or classes. Do *not* invoke any methods or functions on the root level of any files there, as it might create a dependency loop/deadlock situation. (Due to the scripting nature of JS, you can imagine everything is wrapped inside an invisible `main()` function. The engine executes every single line when it runs through the source code.)

State management is handled with MobX in a observer/reactive manner. Access and mutate the state anywhere inside the project via simply referencing the corresponding class attributes inside [`/stores`](src/stores) or reassigning values to them.

Most of the development of the node-link diagram was happening inside [`../misc/network_demo`](https://github.com/DHSTTOS/implementation/tree/master/misc/network_demo), but we have already migrated everything there into [`/src/components/Diagram/NodeLinkBlock.js`](src/components/Diagram/NodeLinkBlock.js).

If you have access to our server, log in as root (I know 😅) and run `boom` to rebuild and redeploy both the login page and this app based on the latest master branch.

## License

The source code of this project (DHSTTOS Frontend) is licensed under [BSD 4-Clause "Original" license](LICENSE).

For other modules of the DHSTTOS platform (eg. the backend server code), please refer to the respective license documents in their own subdirectories.

## Credits

Klevia Ulqinaku - Login Page UI, Data Visualization

Philipp Mergenthaler - Client-Server Communication, Data Visualization

Xiaoru Li - Original UI design, Main Page UI, Data Visualization, Client-Server Communication
