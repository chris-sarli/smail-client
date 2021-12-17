# smail-client

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To start the app locally, run `npm install` and then `npm run start`.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage Notes

Though this client *can* be used for any Smail Pod and mailbox, for testing purposes I've hardcoded it only work with [https://chris-sarli.inrupt.net/smail/chris.sarl/test/](https://chris-sarli.inrupt.net/smail/chris.sarl/test/). This Pod is configured to allow global viewing, so you shouldn't need special permissions to access it, though the client *will* require you to authenticate with a [inrupt.net](https://inrupt.net) WebID.

There are a few areas where the React work is a bit hacky, but it works decently well. Please note, if HTTP requests are slow and you hammer buttons/try to do many things at once, you may accidentally corrupt some data. See the project writeup for more on this limitation.

Additionally, if you click the Compose button, a new message will be created in the drafts directory, but you won't see any immediate visual feedback. Either refresh the drafts directory or navigate to it if you aren't already there. This is a known issue and has nothing to do Smail... it is 100% due to the fact that I did a poor job of planning to integrate React's Router and Inrupt's API doesn't persist state on normal redirects.
