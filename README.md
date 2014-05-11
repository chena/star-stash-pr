# Stash Fave Pull Requests

This JavaScript user script allows you to mark any open, merged, or declined pull requests by starring them in a repository, and list them in a new tab for quick reference. 

This is espcially useful when you want to remember helpful tips from code reviews, or patterns and tricks from the code you have reviewed.

## Usage

Download the user script, then follow the steps using your preferred browser.

### Chrome

1. Go to your Chrome's extensions paeg in your browser `chrome://extensions/`
2. Drag and drop the script into the page; or alternatively, click on "Load unpack extension..." to add it
3. Refresh your Stash page and you should be able to start marking pull requests!

### Firefox

1. Add Firefox add-on [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) for managing User Scripts, if you don't have it already.
2. Drag and drop the script into the "User Scripts" tab.
3. Refresh your Stash page and you should be able to start marking pull requests!

## Notes 

* By default, Stash only loades certain number of pull requests unless the query param "limit" is specified. In order to mark a merged pull request that is old, you need to set the path param (ie. `* /pull-requests?state=merged&limit=200`). Once the item is starred, it should be visible under the Starred tab.
* With the `@match` and `@exclude` rules specified, the script should only be run when navigating to a pull requests view (open, merged, etc), but not when navigating to a specific pull request.
* Information is persisted to HTML5 `localStorage`.
* The script makes use of HTML5 History API's `pushState` method and  `popstate` event for manipulating navigations to and from the Starred tab.


