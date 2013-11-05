# User Script for Stash Favourite Pull Requests

This JavaScript user script allows you to mark any open, merged, or declined pull requests and list them in a new tab for quick reference. 
The script uses the same template that Andrew H put together in his [Stash Enhancements](https://stash.seekersolutions.com/projects/PER/repos/andrewh.stash-enhancements/browse) repo. The same instruction for installation applies.

Notes: 

* By default, Stash only loades certain number of pull requests unless the query param "limit" is specified. In order to mark a merged pull request that is old, we need to set the param (ie. `/pull-requests?state=merged&limit=200`). Once the item is starred, it should be visible under the Starred tab.
* With the `@match` and `@exclude` rules specified, the script should only be run when navigating to a pull requests view (open, merged, etc), but not when navigating to a specific pull request.
* Similar to the Stash Faves script, information is persisted to HTML5 `localStorage`.
* The script makes use of HTML5 History API's `pushState` method and  `popstate` event for manipulating navigations to and from the Starred tab.


